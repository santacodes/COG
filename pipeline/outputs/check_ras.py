import rasterio


def check_geotransform(file_path):
    try:
        with rasterio.open(file_path) as src:
            geotransform = src.transform
            if geotransform:
                print("GeoTransform found:")
                print(geotransform)
            else:
                print("No GeoTransform present.")
    except Exception as e:
        print(f"Error: {e}")

# Path to your file
file_path = "path/to/your/file.tif"
check_geotransform(file_path)

def check_tiff_type(file_path):
    try:
        with rasterio.open(file_path) as src:
            # Check if the file has spatial metadata
            if src.crs:
                print("The file is a GeoTIFF (contains spatial metadata).")
            else:
                print("The file is a regular TIFF (no spatial metadata).")
    except rasterio.errors.RasterioIOError:
        print("The file is not a valid TIFF or GeoTIFF.")

# Path to your file
input_files = ['IMG_MIR.tif', 'IMG_SWIR.tif', 'IMG_TIR1.tif', 'IMG_TIR2.tif', 'IMG_VIS.tif', 'IMG_WV.tif', 'Sat_Azimuth.tif', 'Sat_Elevation.tif', 'Sun_Azimuth.tif', 'Sun_Elevation.tif']

for file_path in input_files:
    check_tiff_type(file_path)
    check_geotransform(file_path)