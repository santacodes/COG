#include "cpl_conv.h" // For CPLMalloc
#include "gdal.h"
#include <stdlib.h>
#include <string.h>

char *CgetHDF5MetadataAttributes(const char *filename) {
  // Initialize GDAL
  GDALAllRegister();

  // Open the dataset
  GDALDatasetH hDataset = GDALOpen(filename, GA_ReadOnly);
  if (hDataset == NULL) {
    return strdup("Error: Unable to open HDF5 file.");
  }

  // Get metadata
  char **metadata = GDALGetMetadata(hDataset, NULL);
  if (metadata == NULL) {
    GDALClose(hDataset);
    return strdup("Error: No metadata available.");
  }

  // Prepare a buffer to hold the metadata as a string
  size_t buffer_size = 1024;
  char *buffer = (char *)malloc(buffer_size);
  buffer[0] = '\0'; // Initialize an empty string

  // Concatenate metadata to the buffer
  for (int i = 0; metadata[i] != NULL; i++) {
    strcat(buffer, metadata[i]);
    strcat(buffer, "\n");
  }

  // Close the dataset
  GDALClose(hDataset);

  return buffer;
}
