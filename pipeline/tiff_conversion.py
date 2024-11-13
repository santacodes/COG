import h5py
import numpy as np

# Open the HDF5 file in read mode
with h5py.File("./SIH2024/3RIMG_04SEP2024_1615_L1B_STD_V01R00.h5", "r") as hdf:
    # List all groups
    print("Keys:", list(hdf.keys()))

    # Access data
    dataset = hdf["IMG_TIR2"][:]
    print(dataset.shape)
    data = np.array(dataset)
    print(data)

from osgeo import gdal

single_band_array = np.squeeze(dataset, axis=0)
# Remove the extra dimension by selecting the first slice
# single_band_array = dataset[0, :, :]  # Shape now becomes (2816, 2805)

# Define output file parameters
output_filename = "output.tif"
height, width = single_band_array.shape

# Create a TIFF file using GDAL
driver = gdal.GetDriverByName("GTiff")
output_ds = driver.Create(output_filename, width, height, 1, gdal.GDT_Float32)

# Optional: Set geotransform and projection if needed
# geotransform = [x_min, pixel_width, 0, y_max, 0, -pixel_height]  # Set accordingly
# output_ds.SetGeoTransform(geotransform)
# srs = osr.SpatialReference()
# srs.ImportFromEPSG(4326)  # Example EPSG code
# output_ds.SetProjection(srs.ExportToWkt())

# Write the single-band data to the TIFF file
output_band = output_ds.GetRasterBand(1)
output_band.WriteArray(single_band_array)
output_band.SetNoDataValue(np.nan)  # Optional: set NoData value if applicable

# Flush and close the dataset
output_band.FlushCache()
output_ds = None
