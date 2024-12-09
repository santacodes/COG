#include "geo_attributes.h"
#include "minmax.h"
#include <gdal.h>
#include <hdf5.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
char *creation_options[] = {"TILED=YES", "COMPRESS=LZW", NULL};

static const char *DATASET_NAMES[] = {"IMG_MIR",  "IMG_SWIR", "IMG_TIR1",
                                      "IMG_TIR2", "IMG_VIS",  "IMG_WV"};
static const int DATASET_COUNT = 6; // Number of datasets

int process_dataset(hid_t file_id, const char *dataset_name,
                    const char *output_file, int width, int height,
                    double geotransform[6]) {
  hid_t dataset_id = H5Dopen(file_id, dataset_name, H5P_DEFAULT);
  if (dataset_id < 0) {
    fprintf(stderr, "Failed to open dataset: %s\n", dataset_name);
    return -1;
  }

  float *data = (float *)malloc(width * height * sizeof(float));
  if (!data) {
    fprintf(stderr, "Memory allocation failed for dataset: %s\n", dataset_name);
    H5Dclose(dataset_id);
    return -1;
  }

  // Read dataset
  if (H5Dread(dataset_id, H5T_NATIVE_FLOAT, H5S_ALL, H5S_ALL, H5P_DEFAULT,
              data) < 0) {
    fprintf(stderr, "Failed to read dataset: %s\n", dataset_name);
    free(data);
    H5Dclose(dataset_id);
    return -1;
  }

  // Initialize GDAL and create output GeoTIFF
  GDALAllRegister();
  GDALDriverH hDriver = GDALGetDriverByName("GTiff");
  if (!hDriver) {
    fprintf(stderr, "GDAL COG driver not found\n");
    free(data);
    H5Dclose(dataset_id);
    return -1;
  }

  GDALDatasetH hOutput = GDALCreate(hDriver, output_file, width, height, 1,
                                    GDT_Float32, creation_options);
  if (!hOutput) {
    fprintf(stderr, "Failed to create GeoTIFF for dataset: %s\n", dataset_name);
    free(data);
    H5Dclose(dataset_id);
    return -1;
  }

  GDALSetGeoTransform(hOutput, geotransform);
  GDALSetProjection(hOutput, "EPSG:4326");

  // Write data to GeoTIFF
  GDALRasterBandH hBand = GDALGetRasterBand(hOutput, 1);
  if (GDALRasterIO(hBand, GF_Write, 0, 0, width, height, data, width, height,
                   GDT_Float32, 0, 0) != CE_None) {
    fprintf(stderr, "Failed to write dataset: %s to GeoTIFF\n", dataset_name);
  }

  GDALSetDescription(hBand, dataset_name);

  // Build overviews for better performance
  int overviewLevels[] = {2, 4};
  if (GDALBuildOverviews(hOutput, "AVERAGE", 2, overviewLevels, 0, NULL, NULL,
                         NULL) != CE_None) {
    fprintf(stderr, "Failed to build overviews for dataset: %s\n",
            dataset_name);
  }
  float minmax[2];
  get_min_max_2d(data, height, width, &minmax[0], &minmax[1]);
  printf("Dataset: %s, Min: %.2f, Max: %.2f\n", dataset_name, minmax[0],
         minmax[1]);
  printf("Min: %.2f, Max: %.2f\n", minmax[0], minmax[1]);

  char min_str[10], max_str[10];
  snprintf(min_str, sizeof(min_str), "%.6f", minmax[0]);
  snprintf(max_str, sizeof(max_str), "%.6f", minmax[1]);
  GDALSetMetadataItem(hBand, "min", min_str, NULL);
  GDALSetMetadataItem(hBand, "max", max_str, NULL);

  // Clean up
  GDALClose(hOutput);
  free(data);
  H5Dclose(dataset_id);

  return 0;
}

int process_hdf5_to_cog(const char *file_name, const char *output_dir,
                        const char *dataset_names[], int dataset_count) {
  hid_t file_id = H5Fopen(file_name, H5F_ACC_RDONLY, H5P_DEFAULT);
  if (file_id < 0) {
    fprintf(stderr, "Failed to open HDF5 file: %s\n", file_name);
    return -1;
  }

  // Fetch dimensions from the first dataset
  hid_t first_dataset_id = H5Dopen(file_id, dataset_names[0], H5P_DEFAULT);
  if (first_dataset_id < 0) {
    fprintf(stderr, "Failed to open the first dataset: %s\n", dataset_names[0]);
    H5Fclose(file_id);
    return -1;
  }

  hsize_t dims[3];
  H5Sget_simple_extent_dims(H5Dget_space(first_dataset_id), dims, NULL);
  int width = dims[2];
  int height = dims[1];
  H5Dclose(first_dataset_id);

  // Fetch geographic attributes
  GeoAttributes attrs = fetch_geo_attributes(file_id);
  printf("Datum: %s\n", attrs.datum);
  printf("Ellipsoid: %s\n", attrs.ellipsoid);
  printf("Left Longitude: %.2f\n", attrs.left_longitude);
  printf("Right Longitude: %.2f\n", attrs.right_longitude);
  printf("Upper Latitude: %.2f\n", attrs.upper_latitude);
  printf("Lower Latitude: %.2f\n", attrs.lower_latitude);

  double geotransform[6] = {
      attrs.left_longitude,
      (attrs.right_longitude - attrs.left_longitude) / width,
      0,
      attrs.upper_latitude,
      0,
      -(attrs.upper_latitude - attrs.lower_latitude) / height};

  // Process each dataset
  for (int i = 0; i < dataset_count; i++) {
    char output_file[256];
    snprintf(output_file, sizeof(output_file), "%s/%s.tif", output_dir,
             dataset_names[i]);

    printf("Processing dataset: %s -> %s\n", dataset_names[i], output_file);

    if (process_dataset(file_id, dataset_names[i], output_file, width, height,
                        geotransform) != 0) {
      fprintf(stderr, "Error processing dataset: %s\n", dataset_names[i]);
    }
  }

  H5Fclose(file_id);
  return 0;
}

int PipelineMain(char *file_name, char *output_dir) {
  // const char *file_name =
  //    "../../../SIH2024/3RIMG_04SEP2024_1015_L1C_ASIA_MER_V01R00.h5";
  // const char *output_dir = "./output";
  // Process HDF5 file and create GeoTIFFs
  if (process_hdf5_to_cog(file_name, output_dir, DATASET_NAMES,
                          DATASET_COUNT) != 0) {
    fprintf(stderr, "Failed to process file: %s\n", file_name);
    return 1;
  }

  printf("GeoTIFFs created successfully in directory: %s\n", output_dir);
  return 0;
}
