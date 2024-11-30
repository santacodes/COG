import h5py
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import numpy as np

# Input and output file paths
hdf5_file = "./SIH2024/3RIMG_04SEP2024_1045_L1C_ASIA_MER_V01R00.h5"
output_tiff_path = "./outputs/stacked_L1C.tif"

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
    subdatasets = [key for key in hdf.keys() if hdf[key].ndim == 3]
    
    if not subdatasets:
        raise ValueError("No valid 3D subdatasets found in the HDF5 file.")
    
    # Extract the first subdataset to get dimensions
    first_dataset = np.squeeze(hdf[subdatasets[0]][:], axis=0)
    width, height = first_dataset.shape
    
    # Compute transform
    transform = from_bounds(left, bottom, right, top, width, height)
    
    # Write all subdatasets into a single GeoTIFF
    with rasterio.open(
        output_tiff_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=len(subdatasets),  # Number of subdatasets as bands
        dtype=first_dataset.dtype,
        crs=crs,
        transform=transform,
    ) as dst:
        for i, key in enumerate(subdatasets, start=1):
            dataset = np.squeeze(hdf[key][:], axis=0)
            if dataset.shape != (width, height):
                raise ValueError(f"Dataset {key} has incompatible dimensions.")
            dst.write(dataset, i)  # Write the dataset to the corresponding band
            print(f"Written subdataset '{key}' to band {i}")

print(f"Stacked GeoTIFF file created successfully: {output_tiff_path}")
