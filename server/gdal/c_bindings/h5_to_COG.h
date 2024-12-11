#ifndef HDF5_TO_COG_H
#define HDF5_TO_COG_H

#include <cuda_runtime.h>
#include <gdal.h>
#include <hdf5.h>

// GeoAttributes struct to hold geographic metadata
typedef struct {
  char datum[64];
  char ellipsoid[64];
  double left_longitude;
  double right_longitude;
  double upper_latitude;
  double lower_latitude;
} GeoAttributes;

/**
 * Fetch geographic attributes from the HDF5 file.
 * @param file_id HDF5 file identifier.
 * @return GeoAttributes containing the geographic metadata.
 */

/**
 * Process a single dataset from an HDF5 file and create a COG (Cloud Optimized
 * GeoTIFF).
 * @param file_id HDF5 file identifier.
 * @param dataset_name Name of the dataset to process.
 * @param output_file Path to the output GeoTIFF file.
 * @param width Width of the dataset.
 * @param height Height of the dataset.
 * @param geotransform Array of 6 values representing the geotransformation
 * matrix.
 * @return 0 on success, -1 on failure.
 */
int process_dataset(hid_t file_id, const char *dataset_name,
                    const char *output_file, int width, int height,
                    double geotransform[6]);

/**
 * Process multiple datasets in an HDF5 file and convert them to COGs.
 * @param file_name Path to the HDF5 file.
 * @param output_dir Directory where the output GeoTIFFs will be stored.
 * @param dataset_names Array of dataset names to process.
 * @param dataset_count Number of datasets in the dataset_names array.
 * @return 0 on success, -1 on failure.
 */
int process_hdf5_to_cog(const char *file_name, const char *output_dir,
                        const char *dataset_names[], int dataset_count);

/**
 * Main pipeline function for processing HDF5 data to COG.
 * @param file_name Path to the HDF5 file.
 * @param output_dir Directory where the output COGs will be saved.
 * @return 0 on success, non-zero on failure.
 */
extern "C" {
int PipelineMain(char *file_name, char *output_dir);
}

#endif // HDF5_TO_COG_H

