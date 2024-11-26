package main

import (
	"fmt"
	"github.com/santacodes/COG/fiberhttp"
	"github.com/santacodes/COG/gdal"
)

func main() {
	// Path to the geospatial file (e.g., GeoTIFF or HDF5 file)
	filePath := "./3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5"
	// Get the metadata attributes
	metadata := COG.GetMetadataAttributes(filePath)

	// Print the metadata
	fmt.Println(metadata)
	fiberhttp.Run_COG()
}
