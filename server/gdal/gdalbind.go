package COG

/*
#cgo pkg-config: hdf5
#cgo CFLAGS: -I/usr/include/gdal
#cgo LDFLAGS: -L/usr/lib -lgdal
#include "gdal.h"
#include "cpl_conv.h"  // For CPLMalloc
#include <stdlib.h>
#include <string.h>

char* CgetHDF5MetadataAttributes(const char* filename) {
    // Initialize GDAL
    GDALAllRegister();

    // Open the dataset
    GDALDatasetH hDataset = GDALOpen(filename, GA_ReadOnly);
    if (hDataset == NULL) {
        return strdup("Error: Unable to open HDF5 file.");
    }

    // Get metadata
    char** metadata = GDALGetMetadata(hDataset, NULL);
    if (metadata == NULL) {
        GDALClose(hDataset);
        return strdup("Error: No metadata available.");
    }

    // Prepare a buffer to hold the metadata as a string
    size_t buffer_size = 1024;
    char* buffer = (char*)malloc(buffer_size);
    buffer[0] = '\0';  // Initialize an empty string

    // Concatenate metadata to the buffer
    for (int i = 0; metadata[i] != NULL; i++) {
        strcat(buffer, metadata[i]);
        strcat(buffer, "\n");
    }

    // Close the dataset
    GDALClose(hDataset);

    return buffer;
}

*/
import "C"
import (
	"unsafe"
)

func GetHDF5MetadataAttributes(filename string) string {
	// Convert Go string to C string
	cFilename := C.CString(filename)
	defer C.free(unsafe.Pointer(cFilename))

	// Call the C function to get metadata
	cResult := C.CgetHDF5MetadataAttributes(cFilename)
	defer C.free(unsafe.Pointer(cResult))

	// Convert C string to Go string and return the result
	result := C.GoString(cResult)
	return result
}
