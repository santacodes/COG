import h5py
import rasterio
from rasterio.transform import from_origin
import numpy as np
# Path to the HDF5 file
hdf5_file = './SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5'

# Open the HDF5 file
with h5py.File(hdf5_file, 'r') as hdf:
    # List all datasets (inspect to find the required dataset)
    print("Datasets in the file:")
    for key in hdf.keys():
        print(key)
    
    # Extract the data array (replace 'DATASET_NAME' with the actual dataset name)
    data = hdf['IMG_VIS'][:]
    single_band_array = np.squeeze(data, axis=0)
    
    print(single_band_array)
    height, width = single_band_array.shape
    # Extract or define geospatial metadata
    # For INSAT-3DR, you may need to refer to the file's metadata or documentation
    pixel_size = 0.1  # Example pixel size in degrees
    upper_left_x = 60.0  # Example longitude of the upper-left corner
    upper_left_y = 30.0  # Example latitude of the upper-left corner
    transform = from_origin(upper_left_x, upper_left_y, pixel_size, pixel_size)

# Define CRS (example: WGS84)
crs = 'EPSG:4326'
#print(data,"\n",data.shape)
# Write the data to GeoTIFF
with rasterio.open(
    './outputs/output.tif',
    'w',
    driver='GTiff',
    height=height,
    width=width,
    count=1,  # Single band
    dtype=data.dtype,
    crs=crs,
    transform=transform
) as dst:
    dst.write(single_band_array, 1)
