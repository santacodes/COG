#ifndef MERGE_TIFF_H
#define MERGE_TIFF_H

#include "gdal.h"
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

// Function to merge multiple single-band GeoTIFF files into a single multi-band GeoTIFF file
// Parameters:
// - outputPath: Path to the output multi-band GeoTIFF file
// - inputPaths: Array of paths to the single-band GeoTIFF input files
// - numBands: Number of input files (and bands in the output file)
void mergeGeoTIFFs(const char *outputPath, const char **inputPaths, int numBands);

#endif // MERGE_TIFF_H
