package COG

/*
#cgo pkg-config: hdf5
#cgo CFLAGS: -I./c_bindings
#cgo LDFLAGS: -L./c_bindings/build -linsat_bindings -L/usr/lib -lgdal
#include "h5_to_stacked_L1C.h"
#include <stdlib.h>
*/
import "C"
import (
	"unsafe"
)

func PipelineMainL1C(filename string, outputdir string) int {
	cFilename := C.CString(filename)
	cOutputdir := C.CString(outputdir)
	defer C.free(unsafe.Pointer(cFilename))
	defer C.free(unsafe.Pointer(cOutputdir))

	// Call the C function with proper arguments
	cResult := C.PipelineMainL1C(cFilename, cOutputdir)

	// Return the result
	return int(cResult)

	// Convert C string to Go string and return the result
}
