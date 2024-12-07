import h5py
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
from rasterio.enums import Resampling
import numpy as np
import time


# Input and output file paths


# image_files=[]
def convertToCOG(hdf5_file, output_dir):
    # Read the HDF5 file
    with h5py.File(hdf5_file, "r") as hdf:
        metadata = hdf["/"].attrs
        # left, bottom, right, top                # Bounding box
        top = metadata.get("upper_latitude", 0)
        bottom = metadata.get("lower_latitude", 0)
        left = metadata.get("left_longitude", 0)
        right = metadata.get("right_longitude", 0)
        print(top, bottom, left, right)
        crs = CRS.from_epsg(4326)  # WGS84 CRS
            
        if not top or not right or not left or not right:
            raise ValueError(
                "Required georeferencing metadata is missing in the HDF5 file."
            )

        keys = ["IMG_MIR", "IMG_SWIR", "IMG_TIR1", "IMG_TIR2", "IMG_VIS", "IMG_WV"]

        for key in keys:
            # print(key)
            data = hdf[key][:]
            print(key, data.shape)
            if data.ndim == 3:
                dataset = np.squeeze(data, axis=0)

                width, height = dataset.shape  # Dimensions

                # Compute the transform
                transform = from_bounds(left, bottom, right, top, width, height)
                output_tiff_path=output_dir+key+".tif"
                # image_files.append(output_tiff_path)
                # Write the dataset to a GeoTIFF file

                with rasterio.Env(
                    GDAL_TIFF_INTERNAL_MASK=True,  # Required for COG
                    GDAL_CACHEMAX=512,
                ):  # Optional: Adjust based on available memory
                    with rasterio.open(
                        output_tiff_path,
                        "w",
                        driver="COG",
                        height=dataset.shape[0],
                        width=dataset.shape[1],
                        count=1,  # Single band
                        dtype=dataset.dtype,
                        crs=crs,
                        transform=transform,
                        BLOCKSIZE=512,  # Tile size
                        COMPRESS="LZW",  # Compression method
                        RESAMPLING=Resampling.nearest,
                    ) as dst:
                        dst.write(dataset, 1)  # Write the dataset to band 1
                        dst.set_band_description(1, key)
                        band_min = dataset.min()
                        band_max = dataset.max()

                    # Write min and max values as metadata
                        dst.update_tags(band=key, min=band_min, max=band_max)
                    
                    print(f"GeoTIFF(COG) file created successfully: {output_tiff_path}")


if __name__ == "__main__":
    start_time = time.time()
    convertToCOG("../SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5","./outputs/")
    end_time = time.time()
    print(f"Runtime: {end_time - start_time:.2f} seconds")


# STACKING PROCESS
# print(image_files)
# # images = [imageio.v2.imread(img) for img in image_files]

# # Save stacked images into one TIFF file
# datasets = [rasterio.open(f) for f in image_files]

# # Check that all images have the same dimensions
# width, height = datasets[0].width, datasets[0].height
# if not all(ds.width == width and ds.height == height for ds in datasets):
#     raise ValueError("All input images must have the same dimensions.")

# # Metadata for the output file
# meta = datasets[0].meta.copy()
# meta.update({"count": len(datasets), "dtype": datasets[0].dtypes[0]})

# # Write to a new multi-band TIFF
# output_file = './outputs/'+"demostack.tif"
# with rasterio.open(output_file, "w", **meta) as dst:
#     for idx, ds in enumerate(datasets, start=1):
#         dst.write(ds.read(1), idx)  # Write each band to the output

# # Close datasets
# for ds in datasets:
#     ds.close()

# print(f"Stacked TIFF saved as {output_file}")

