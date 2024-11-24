#ifndef CONVERT_H5_TO_GEOTIFF_H
#define CONVERT_H5_TO_GEOTIFF_H

// Function to convert an HDF5 subdataset to a GeoTIFF file
// Arguments:
// - subDataset: Path to the HDF5 subdataset (e.g., "HDF5:/path/to/file.h5://subdataset_name")
// - outputFilename: Path to the output GeoTIFF file (e.g., "output.tif")
// - geoTransform: Array of 6 doubles that define the geotransform (e.g., [originX, pixelWidth, 0, originY, 0, pixelHeight])
// - projection: Projection string (e.g., "EPSG:4326")
//
// Returns: 0 on success, 1 on failure
int convertH5ToGeoTIFF(const char *subDataset, const char *outputFilename, 
                       double *geoTransform, const char *projection, 
                       int width, int height)

#endif  // CONVERT_H5_TO_GEOTIFF_H