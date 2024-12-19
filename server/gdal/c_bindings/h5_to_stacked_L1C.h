#ifndef H5_TO_STACKED_L1C_H
#define H5_TO_STACKED_L1C_H

#include <gdal.h>
#include <hdf5.h>

// Constants
static const int DATASET_COUNT = 6; // Number of datasets
extern const char *DATASET_NAMES[];

// GeoAttributes structure
typedef struct {
  char datum[64];
  char ellipsoid[64];
  double left_longitude;
  double right_longitude;
  double upper_latitude;
  double lower_latitude;
} GeoAttributes;

// Function Prototypes

/**
 * Fetch geographic attributes from an HDF5 file.
 * @param file_id The HDF5 file ID.
 * @return GeoAttributes structure containing the geographic data.
 */
GeoAttributes fetch_geo_attributes(hid_t file_id);

/**
 * Process a single HDF5 dataset and write its data to a GeoTIFF band.
 * @param file_id The HDF5 file ID.
 * @param dataset_name Name of the dataset to process.
 * @param hOutput GDALDatasetH handle to the output GeoTIFF file.
 * @param band_index The index of the GeoTIFF band.
 * @return 0 on success, -1 on failure.
 */
int process_dataset(hid_t file_id, const char *dataset_name,
                    GDALDatasetH hOutput, int band_index);

/**
 * Convert an HDF5 file to a Cloud Optimized GeoTIFF (COG).
 * @param file_name The path to the HDF5 file.
 * @param output_file The path to the output GeoTIFF file.
 * @param dataset_names Array of dataset names to process.
 * @param dataset_count Number of datasets to process.
 * @return 0 on success, -1 on failure.
 */
int process_hdf5_to_cog(const char *file_name, const char *output_file,
                        const char *dataset_names[], int dataset_count);

/**
 * Main pipeline function for processing L1C datasets.
 * @param filename The input HDF5 file path.
 * @param output_file The output GeoTIFF file path.
 * @return 0 on success, 1 on failure.
 */
int PipelineMainL1C(char *filename, char *output_file);

#endif // H5_TO_STACKED_L1C_H
