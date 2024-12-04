#include "cpl_conv.h" // For CPLMalloc
#include "gdal.h"
#include <omp.h> // OpenMP for parallel processing NOTE: this is more portable across windows and unix. Dont use pthreads
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main(int argc, char *argv[]) {
  if (argc != 3) {
    printf("Usage: %s <input HDF5 file> <output directory>\n", argv[0]);
    return 1;
  }

  const char *hdf5_file = argv[1];
  const char *output_dir = argv[2];
  clock_t start, end;

  start = clock();

  // Initialize GDAL
  GDALAllRegister();

  // Open the HDF5 file
  // GDALDatasetH hDataset = GDALOpen(hdf5_file, GA_ReadOnly);
  GDALDatasetH hDataset = GDALOpenEx(hdf5_file, GDAL_OF_READONLY | GDAL_OF_RASTER, NULL, NULL, NULL);

  if (hDataset == NULL) {
    printf("Error: Unable to open HDF5 file '%s'.\n", hdf5_file);
    return 1;
  }

  // Read georeferencing metadata
double top = 0, bottom = 0, left = 0, right = 0;

// Fetch all required metadata at once
const char *upper_lat = GDALGetMetadataItem(hDataset, "upper_latitude", NULL);
const char *lower_lat = GDALGetMetadataItem(hDataset, "lower_latitude", NULL);
const char *left_lon = GDALGetMetadataItem(hDataset, "left_longitude", NULL);
const char *right_lon = GDALGetMetadataItem(hDataset, "right_longitude", NULL);

// Validate all metadata in a single check
if (!(upper_lat && lower_lat && left_lon && right_lon)) {
    printf("Error: Required georeferencing metadata is missing.\n");
    GDALClose(hDataset);
    return 1;
}

// Convert metadata to double
top = atof(upper_lat);
bottom = atof(lower_lat);
left = atof(left_lon);
right = atof(right_lon);

// Print the bounding box
printf("Bounding Box: top=%f, bottom=%f, left=%f, right=%f\n", top, bottom, left, right);

  // Get the list of subdatasets
  char **subdatasets = GDALGetMetadata(hDataset, "SUBDATASETS");
  if (subdatasets == NULL) {
    printf("Error: No subdatasets found in '%s'.\n", hdf5_file);
    GDALClose(hDataset);
    return 1;
  }

  // Create output filename
  char output_file[1024];
  snprintf(output_file, sizeof(output_file), "%s/output.tif", output_dir);

  // Create the GeoTIFF file with 10 bands
  GDALDriverH hDriver = GDALGetDriverByName("GTiff");
  GDALDatasetH hOutput =
      GDALCreate(hDriver, output_file, 1737, 1616, 10, GDT_Int32, NULL);
  if (hOutput == NULL) {
    printf("Error: Unable to create GeoTIFF file '%s'.\n", output_file);
    GDALClose(hDataset);
    return 1;
  }

  // Compute transform
  double transform[6] = {0};
  transform[0] = left;                  // Top-left X
  transform[3] = top;                   // Top-left Y
  transform[1] = (right - left) / 1737; // Pixel width
  transform[5] =
      (bottom - top) / 1616; // Pixel height (negative for top to bottom)

  // Set geotransform and projection for the output
  GDALSetGeoTransform(hOutput, transform);
  const char *wgs84_wkt = "GEOGCS[\"WGS 84\","
                          "DATUM[\"WGS_1984\","
                          "SPHEROID[\"WGS 84\",6378137,298.257223563]],"
                          "PRIMEM[\"Greenwich\",0],"
                          "UNIT[\"degree\",0.0174532925199433]]";
  GDALSetProjection(hOutput, wgs84_wkt);

  // Reuse memory buffers
  int *data = (int *)CPLMalloc(sizeof(int) * 1737 * 1616);

  // Parallel processing of subdatasets
  int bandIndex = 1;
#pragma omp parallel for shared(subdatasets, hOutput, data) schedule(dynamic)
  for (int i = 0; subdatasets[i] != NULL; i += 2) {
    const char *subdataset_path =
        strstr(subdatasets[i], "_NAME=") + strlen("_NAME=");
    if (!subdataset_path)
      continue;

    printf("Processing subdataset: %s\n", subdataset_path);

    // Open the subdataset
    GDALDatasetH hSubDataset = GDALOpen(subdataset_path, GA_ReadOnly);
    if (hSubDataset == NULL) {
      printf("Error: Unable to open subdataset '%s'.\n", subdataset_path);
      continue;
    }

    // Read data from the first raster band
    GDALRasterBandH hBand = GDALGetRasterBand(hSubDataset, 1);
    if (hBand == NULL) {
      printf("Error: Unable to get raster band for subdataset '%s'.\n",
             subdataset_path);
      GDALClose(hSubDataset);
      continue;
    }

    if (GDALRasterIO(hBand, GF_Read, 0, 0, 1737, 1616, data, 1737, 1616,
                     GDT_Int32, 0, 0) != CE_None) {
      printf("Error: Unable to read data from subdataset '%s'.\n",
             subdataset_path);
      GDALClose(hSubDataset);
      continue;
    }

    // Write data to the corresponding band in the output file
    GDALRasterBandH hOutputBand = GDALGetRasterBand(hOutput, bandIndex);
    if (GDALRasterIO(hOutputBand, GF_Write, 0, 0, 1737, 1616, data, 1737, 1616,
                     GDT_Int32, 0, 0) != CE_None) {
      printf("Error: Unable to write data to GeoTIFF file '%s'.\n",
             output_file);
    }

// Increment band index
#pragma omp critical
    bandIndex++;

    GDALClose(hSubDataset);
  }

  // Cleanup
  CPLFree(data);
  GDALClose(hOutput);
  GDALClose(hDataset);

  end = clock();
  printf("Time taken: %.2f seconds\n",
         ((double)(end - start)) / CLOCKS_PER_SEC);

  return 0;
}
