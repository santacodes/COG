import h5py
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import numpy as np
from rasterio.enums import Resampling
from rasterio.enums import ColorInterp
import time


def create_stacked_COG(hdf5_file, output_cog_path):
    """
    Create a Cloud Optimized GeoTIFF (COG).

    Parameters:
        output_cog_path (str): Path to save the COG file.
        hdf5_file (str): Path to H5 file.
    """
    # Read the HDF5 file
    with h5py.File(hdf5_file, 'r') as hdf:
        metadata = hdf["/"].attrs
        # Bounding box
        top = metadata.get('upper_latitude', 0)
        bottom = metadata.get('lower_latitude', 0)
        left = metadata.get('left_longitude', 0)
        right = metadata.get('right_longitude', 0)

        print("Bounding Box:", top, bottom, left, right)
        
        # Ensure metadata exists
        if not top or not bottom or not left or not right:
            raise ValueError("Required georeferencing metadata is missing in the HDF5 file.")
        
        crs = CRS.from_epsg(4326)  # WGS84 CRS
        subdatasets = ["IMG_MIR", "IMG_SWIR", "IMG_TIR1", "IMG_TIR2", "IMG_VIS", "IMG_WV"]

        if not subdatasets:
            raise ValueError("No valid subdatasets found in the HDF5 file.")
        
        # Extract the first subdataset to get dimensions
        first_dataset = np.squeeze(hdf[subdatasets[0]][:], axis=0)
        width, height = first_dataset.shape
        
        # Compute transform
        transform = from_bounds(left, bottom, right, top, width, height)

        # Write all subdatasets into a single GeoTIFF
        with rasterio.Env(
            GDAL_TIFF_INTERNAL_MASK=True,  # Required for COG
            GDAL_CACHEMAX=512  # Optional: Adjust based on available memory
        ):
            with rasterio.open(
                output_cog_path,
                'w',
                driver='COG',
                height=height,
                width=width,
                count=len(subdatasets),  # Number of subdatasets as bands
                dtype=first_dataset.dtype,
                crs=crs,
                transform=transform,
                BLOCKSIZE=256,  # Tile size
                COMPRESS="DEFLATE",  # Compression method
                RESAMPLING=Resampling.nearest,
            ) as dst:
                for i, key in enumerate(subdatasets, start=1):
                    dataset = np.squeeze(hdf[key][:], axis=0)
                    if dataset.shape != (width, height):
                        raise ValueError(f"Dataset {key} has incompatible dimensions.")
                    
                    # Write the dataset to the corresponding band
                    dst.write(dataset, i)
                    dst.set_band_description(i, key)

                    # Calculate min and max values for the band
                    band_min = dataset.min()
                    band_max = dataset.max()

                    # Write min and max values as metadata
                    dst.update_tags(bidx=i, min=band_min, max=band_max)
                    # dst.colorinterp[i - 1] = ColorInterp.gray
                    print(f"Written subdataset '{key}' to band {i}, Min: {band_min}, Max: {band_max}")

    print(f"Stacked GeoTIFF (COG) file created successfully: {output_cog_path}")


if __name__ == "__main__":
    start_time = time.time()
    create_stacked_COG("../SIH2024/3RIMG_04SEP2024_1015_L1C_ASIA_MER_V01R00.h5", "./stacked.tif")
    end_time = time.time()
    print(f"Runtime: {end_time - start_time:.2f} seconds")
