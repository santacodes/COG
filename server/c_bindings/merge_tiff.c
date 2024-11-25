#include "gdal.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
void mergeGeoTIFFs(const char *outputPath, const char **inputPaths, int numBands) {
    GDALAllRegister();

    // Open the first input dataset to copy its metadata
    GDALDatasetH hFirstDataset = GDALOpen(inputPaths[0], GA_ReadOnly);
    if (hFirstDataset == NULL) {
        printf("Failed to open input file: %s\n", inputPaths[0]);
        return;
    }

    // Get raster size and geotransform from the first dataset
    int width = GDALGetRasterXSize(hFirstDataset);
    int height = GDALGetRasterYSize(hFirstDataset);
    double geoTransform[6];
    if (GDALGetGeoTransform(hFirstDataset, geoTransform) != CE_None) {
        printf("Failed to get GeoTransform from input file: %s\n", inputPaths[0]);
        GDALClose(hFirstDataset);
        return;
    }

    const char *projection = GDALGetProjectionRef(hFirstDataset);

    // Create output dataset
    GDALDriverH hDriver = GDALGetDriverByName("GTiff");
    if (hDriver == NULL) {
        printf("GTiff driver not found.\n");
        GDALClose(hFirstDataset);
        return;
    }

    GDALDatasetH hOutputDataset = GDALCreate(hDriver, outputPath, width, height, numBands, GDT_UInt16, NULL);
    if (hOutputDataset == NULL) {
        printf("Failed to create output file: %s\n", outputPath);
        GDALClose(hFirstDataset);
        return;
    }

    // Set geotransform and projection
    GDALSetGeoTransform(hOutputDataset, geoTransform);
    GDALSetProjection(hOutputDataset, projection);

    // Loop through each input file and add it as a band to the output dataset
    for (int i = 0; i < numBands; i++) {
        GDALDatasetH hInputDataset = GDALOpen(inputPaths[i], GA_ReadOnly);
        if (hInputDataset == NULL) {
            printf("Failed to open input file: %s\n", inputPaths[i]);
            continue;
        }

        GDALRasterBandH hInputBand = GDALGetRasterBand(hInputDataset, 1);
        GDALRasterBandH hOutputBand = GDALGetRasterBand(hOutputDataset, i + 1);

        if (hInputBand == NULL || hOutputBand == NULL) {
            printf("Failed to get raster band for file: %s\n", inputPaths[i]);
            GDALClose(hInputDataset);
            continue;
        }

        // Allocate memory for reading and writing raster data
        uint16_t *buffer = (uint16_t *)malloc(sizeof(uint16_t) * width * height);
        if (buffer == NULL) {
            printf("Memory allocation failed for band %d.\n", i + 1);
            GDALClose(hInputDataset);
            continue;
        }

        // Read and write raster data
        if (GDALRasterIO(hInputBand, GF_Read, 0, 0, width, height, buffer, width, height, GDT_UInt16, 0, 0) != CE_None) {
            printf("Failed to read raster data from file: %s\n", inputPaths[i]);
            free(buffer);
            GDALClose(hInputDataset);
            continue;
        }

        if (GDALRasterIO(hOutputBand, GF_Write, 0, 0, width, height, buffer, width, height, GDT_UInt16, 0, 0) != CE_None) {
            printf("Failed to write raster data to output for band %d.\n", i + 1);
            free(buffer);
            GDALClose(hInputDataset);
            continue;
        }

        free(buffer);
        GDALClose(hInputDataset);
    }

    GDALClose(hOutputDataset);
    GDALClose(hFirstDataset);

    printf("Successfully merged %d single-band GeoTIFFs into %s.\n", numBands, outputPath);
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("Usage: %s <output_tif> <input_tif1> <input_tif2> ...\n", argv[0]);
        return 1;
    }

    const char *outputPath = argv[1];
    const char **inputPaths = (const char **)&argv[2];
    int numBands = argc - 2;

    mergeGeoTIFFs(outputPath, inputPaths, numBands);

    return 0;
}
// to compile   gcc -o merge_tiff merge_tiff.c -lgdal -I /usr/include/gdal
//to run    ./merge_tiff output_multiband.tif output_MIR.tif output_TIR1.tif