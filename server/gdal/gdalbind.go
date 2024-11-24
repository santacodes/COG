package COG

/*
#cgo pkg-config: hdf5
#cgo CFLAGS: -I/usr/include/gdal
#cgo LDFLAGS: -L/usr/lib -lgdal
#include "../c_bindings/insat_metadata.h"
#include <stdlib.h>
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
