package main

import (
	"fmt"
	"github.com/santacodes/COG/gdal"
)

func main() {
	// Path to the geospatial file (e.g., GeoTIFF or HDF5 file)
	filePath := "../pipeline/SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5"
	// Run gdalinfo
	output, err := COG.RunGdalInfo(filePath)
	if err != nil {
		fmt.Printf("Error: %s\n", err)
		return
	}
	// Parse the output into a hashmap
	metadata := COG.ParseGdalInfoOutput(output)

	// Print the metadata map
	fmt.Println("GDAL Metadata:")
	fmt.Println(metadata["Corner Coordinates"])
	//for key, value := range metadata {
	//	fmt.Printf("%s: %s\n", key, value)
	//}
}
