from osgeo import gdal, osr
import h5py
import numpy as np

# Load the HDF5 file
input_file_path = './SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5'
output_file_path = 'output_georefffftiff.tiff'

# Open the HDF5 file and extract a dataset
with h5py.File(input_file_path, 'r') as h5_file:
    # Replace 'YourDatasetName' with the actual dataset name in the HDF5 file
    dataset_name = 'IMG_TIR2'
    data = h5_file[dataset_name][:]
    print(data.shape)
    #data = np.array(dataset)
    print(data)
# Set GeoTIFF parameters (example geotransform and EPSG code)
top_left_x = -180.0       # X-coordinate of the top-left corner
top_left_y = 90.0         # Y-coordinate of the top-left corner
pixel_width = 0.01        # Pixel width in spatial units
pixel_height = -0.01      # Pixel height in spatial units

# Create geotransform
geotransform = [top_left_x, pixel_width, 0, top_left_y, 0, pixel_height]
single_band_array = np.squeeze(data, axis=0)
print(single_band_array)
height, width = single_band_array.shape
# Create output GeoTIFF file with GDAL
driver = gdal.GetDriverByName('GTiff')
output_ds = driver.Create(output_file_path, width, height, 1, gdal.GDT_Float32)

# Set the geotransform and projection
output_ds.SetGeoTransform(geotransform)
srs = osr.SpatialReference()
srs.ImportFromEPSG(4326)  # WGS84
output_ds.SetProjection(srs.ExportToWkt())

# Write data to GeoTIFF band
output_band = output_ds.GetRasterBand(1)
output_band.WriteArray(single_band_array)
output_band.SetNoDataValue(np.nan)

# Save and close the dataset
output_ds.FlushCache()
output_ds = None

print("GeoTIFF created successfully at", output_file_path)
