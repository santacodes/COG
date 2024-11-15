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
file_path = "output.tif"
check_tiff_type(file_path)
check_geotransform(file_path)