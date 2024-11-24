#include "gdal.h"
#include "cpl_conv.h"  // Include this for CPLMalloc
#include <stdio.h>
#include <stdint.h>  // Include this for uint16_t

// Function to convert HDF5 subdataset to GeoTIFF
int convertH5ToGeoTIFF(const char *subDataset, const char *outputFilename, 
                       double *geoTransform, const char *projection, 
                       int width, int height) {
    // Open the subdataset
    GDALDatasetH hDataset = GDALOpen(subDataset, GA_ReadOnly);
    if (hDataset == NULL) {
        printf("Failed to open subdataset: %s\n", subDataset);
        return 1;
    }

    // Retrieve the first raster band
    GDALRasterBandH hBand = GDALGetRasterBand(hDataset, 1);
    if (hBand == NULL) {
        printf("Failed to get raster band.\n");
        GDALClose(hDataset);
        return 1;
    }

    // Set up the GeoTIFF driver
    GDALDriverH hDriver = GDALGetDriverByName("GTiff");
    if (hDriver == NULL) {
        printf("GeoTIFF driver not available.\n");
        GDALClose(hDataset);
        return 1;
    }

    // Create the output GeoTIFF dataset
    GDALDatasetH hOutDataset = GDALCreate(hDriver, outputFilename, width, height, 1, GDT_UInt16, NULL);
    if (hOutDataset == NULL) {
        printf("Failed to create GeoTIFF dataset.\n");
        GDALClose(hDataset);
        return 1;
    }

    // Set the geotransform and projection from the provided arguments
    GDALSetGeoTransform(hOutDataset, geoTransform);
    GDALSetProjection(hOutDataset, projection);

    // Allocate memory for the raster data
    uint16_t *pData = (uint16_t *)CPLMalloc(sizeof(uint16_t) * width * height);

    // Read the raster data
    CPLErr err = GDALRasterIO(hBand, GF_Read, 0, 0, width, height, pData, width, height, GDT_UInt16, 0, 0);
    if (err != CE_None) {
        printf("Error reading the raster band data.\n");
        CPLFree(pData);
        GDALClose(hDataset);
        GDALClose(hOutDataset);
        return 1;
    }

    // Write the data to the output raster band
    GDALRasterBandH hOutBand = GDALGetRasterBand(hOutDataset, 1);
    err = GDALRasterIO(hOutBand, GF_Write, 0, 0, width, height, pData, width, height, GDT_UInt16, 0, 0);
    if (err != CE_None) {
        printf("Error writing the data to GeoTIFF.\n");
        CPLFree(pData);
        GDALClose(hDataset);
        GDALClose(hOutDataset);
        return 1;
    }

    // Free memory and close datasets
    CPLFree(pData);
    GDALClose(hDataset);
    GDALClose(hOutDataset);

    printf("Successfully converted to GeoTIFF: %s\n", outputFilename);
    return 0;
}

int main() {
    // Register all GDAL formats
    GDALAllRegister();

    // Define the subdataset and metadata for conversion
    const char *subDataset = "HDF5:\"/home/jayavishnu/Documents/1738SIH/geoTIFF/COG/pipeline/SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5\"://IMG_MIR";
    const char *outputFilename = "output.tif";

    // Geotransform parameters (based on metadata)
    double geoTransform[6] = { 634.8015441962551222, 4.546763628841097749, 0, 6034.3929117445522934, 0, -4.546763628841097749 };

    // Projection (WGS 84 - EPSG:4326)
    const char *projection = "EPSG:4326";

    // Image dimensions (width and height)
    int width = 2805;
    int height = 2816;

    // Call the function to convert the HDF5 subdataset to GeoTIFF
    return convertH5ToGeoTIFF(subDataset, outputFilename, geoTransform, projection, width, height);
}
