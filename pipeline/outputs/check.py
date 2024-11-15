from osgeo import gdal

def check_geotiff(filename):
    dataset = gdal.Open(filename)
    
    # Check for projection
    projection = dataset.GetProjection()
    if projection:
        print("File has a spatial reference system (GeoTIFF).")
    else:
        print("File does not have a spatial reference system (TIFF).")
    
    # Check for geotransform
    geotransform = dataset.GetGeoTransform()
    if geotransform and geotransform != (0, 1, 0, 0, 0, 1):
        print("File has geotransform data (GeoTIFF).")
        print("GeoTransform:", geotransform)
    else:
        print("File does not have geotransform data (TIFF).")
    
    dataset = None

# Run the function on your files
check_geotiff("output_georefffftiff.tif")
