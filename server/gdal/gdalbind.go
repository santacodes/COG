package COG

/*
#cgo pkg-config: hdf5
#cgo CFLAGS: -I./c_bindings
#cgo LDFLAGS: -L./c_bindings/build -linsat_bindings -L/usr/lib -lgdal -lhdf5
#include "c_bindings/insat_metadata.h"
#include <stdlib.h>
*/
import "C"
import (
	"unsafe"
)

// GetMetadataAttributes retrieves metadata attributes from the given filename.
func GetMetadataAttributes(filename string) string {
	// Convert Go string to C string
	cFilename := C.CString(filename)
	defer C.free(unsafe.Pointer(cFilename))

	// Call the C function to get metadata
	cResult := C.CgetHDF5MetadataAttributes(cFilename)
	defer C.free(unsafe.Pointer(cResult))

	// Convert C string to Go string and return the result
	return C.GoString(cResult)
}
