package COG

/*
#cgo pkg-config: hdf5
#cgo CFLAGS: -I./c_bindings
#cgo LDFLAGS: -L./c_bindings/build -linsat_bindings -L/usr/lib -lgdal
#include "h5_to_COG.h"
#include <stdlib.h>
*/
import "C"
import (
	"unsafe"
)

func PipelineMain(filename string, outputdir string) int {
	cFilename := C.CString(filename)
	cOutputdir := C.CString(outputdir)
	defer C.free(unsafe.Pointer(cFilename))
	defer C.free(unsafe.Pointer(cOutputdir))

	// Call the C function with proper arguments
	cResult := C.PipelineMain(cFilename, cOutputdir)

	// Return the result
	return int(cResult)

	// Convert C string to Go string and return the result
}
