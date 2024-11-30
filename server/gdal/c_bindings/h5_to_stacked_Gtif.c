#include "gdal.h"
#include "cpl_conv.h" // For CPLMalloc
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        printf("Usage: %s <input HDF5 file> <output directory>\n", argv[0]);
        return 1;
    }

    const char *hdf5_file = argv[1];
    const char *output_dir = argv[2];
    clock_t start, end;
    double cpu_time_used;

    start = clock();

    // Initialize GDAL
    GDALAllRegister();

    // Open the HDF5 file
    GDALDatasetH hDataset = GDALOpen(hdf5_file, GA_ReadOnly);
    if (hDataset == NULL) {
        printf("Error: Unable to open HDF5 file '%s'.\n", hdf5_file);
        return 1;
    }

    // Read georeferencing metadata
    double top = 0, bottom = 0, left = 0, right = 0;
    int hasGeoMetadata = 
        GDALGetMetadataItem(hDataset, "upper_latitude", NULL) &&
        GDALGetMetadataItem(hDataset, "lower_latitude", NULL) &&
        GDALGetMetadataItem(hDataset, "left_longitude", NULL) &&
        GDALGetMetadataItem(hDataset, "right_longitude", NULL);

    if (!hasGeoMetadata) {
        printf("Error: Required georeferencing metadata is missing.\n");
        GDALClose(hDataset);
        return 1;
    }
    
    top = atof(GDALGetMetadataItem(hDataset, "upper_latitude", NULL));
    bottom = atof(GDALGetMetadataItem(hDataset, "lower_latitude", NULL));
    left = atof(GDALGetMetadataItem(hDataset, "left_longitude", NULL));
    right = atof(GDALGetMetadataItem(hDataset, "right_longitude", NULL));

    printf("Bounding Box: top=%f, bottom=%f, left=%f, right=%f\n", top, bottom, left, right);

    // Get the list of subdatasets
    char **subdatasets = GDALGetMetadata(hDataset, "SUBDATASETS");
    if (subdatasets == NULL) {
        printf("Error: No subdatasets found in '%s'.\n", hdf5_file);
        GDALClose(hDataset);
        return 1;
    }
    
    // Create output filename
    char output_file[1024];
    snprintf(output_file, sizeof(output_file), "%s/output.tif", output_dir);

    // Create the GeoTIFF file with 10 bands
    GDALDriverH hDriver = GDALGetDriverByName("GTiff");
    GDALDatasetH hOutput = GDALCreate(hDriver, output_file, 1737,1616, 10, GDT_Int32, NULL);
    if (hOutput == NULL) {
        printf("Error: Unable to create GeoTIFF file '%s'.\n", output_file);
        GDALClose(hDataset);
        return 1;
    }

    // Compute transform
    double transform[6] = {0};
    transform[0] = left;                   // Top-left X
    transform[3] = top;                    // Top-left Y
    transform[1] = (right - left) / GDALGetRasterXSize(hDataset); // Pixel width
    transform[5] = (bottom - top) / GDALGetRasterYSize(hDataset); // Pixel height (negative for top to bottom)

    // Set geotransform for the output
    GDALSetGeoTransform(hOutput, transform);

    // Set projection (WGS 84)
    const char *wgs84_wkt = "GEOGCS[\"WGS 84\","
                            "DATUM[\"WGS_1984\","
                            "SPHEROID[\"WGS 84\",6378137,298.257223563]],"
                            "PRIMEM[\"Greenwich\",0],"
                            "UNIT[\"degree\",0.0174532925199433]]";
    GDALSetProjection(hOutput, wgs84_wkt);

    // Process each subdataset
    int bandIndex = 1; // Band index starts at 1 for GeoTIFF
    for (int i = 0; subdatasets[i] != NULL; i += 2) {
        const char *subdataset_name = subdatasets[i] + strlen("SUBDATASET_");
        const char *key_name = strstr(subdataset_name, "_NAME=");
        
        if (!key_name) continue;

        const char *subdataset_path = key_name + strlen("_NAME=");
        printf("Processing subdataset: %s\n", subdataset_path);
            
        // Open the subdataset
        GDALDatasetH hSubDataset = GDALOpen(subdataset_path, GA_ReadOnly);
        if (hSubDataset == NULL) {
            printf("Error: Unable to open subdataset '%s'.\n", subdataset_path);
            continue;
        }

        // Get dataset dimensions
        int width = GDALGetRasterXSize(hSubDataset);
        int height = GDALGetRasterYSize(hSubDataset);
        if (width <= 0 || height <= 0) {
            printf("Skipping subdataset with invalid dimensions.\n");
            GDALClose(hSubDataset);
            continue;
        }

        // Read data from the first raster band
        GDALRasterBandH hBand = GDALGetRasterBand(hSubDataset, 1);
        if (hBand == NULL) {
            printf("Error: Unable to get raster band for subdataset '%s'.\n", subdataset_path);
            GDALClose(hSubDataset);
            continue;
        }

        int *data = (int *)CPLMalloc(sizeof(int) * width * height);
        if (GDALRasterIO(hBand, GF_Read, 0, 0, width, height, data, width, height, GDT_Int32, 0, 0) != CE_None) {
            printf("Error: Unable to read data from subdataset '%s'.\n", subdataset_path);
            CPLFree(data);
            GDALClose(hSubDataset);
            continue;
        }

        // Write data to the corresponding band in the output file
        GDALRasterBandH hOutputBand = GDALGetRasterBand(hOutput, bandIndex);
        if (GDALRasterIO(hOutputBand, GF_Write, 0, 0, width, height, data, width, height, GDT_Int32, 0, 0) != CE_None) {
            printf("Error: Unable to write data to GeoTIFF file '%s'.\n", output_file);
            CPLFree(data);
            GDALClose(hSubDataset);
            continue;
        }

        // Increment band index for the next subdataset
        bandIndex++;

        // Cleanup
        CPLFree(data);
        GDALClose(hSubDataset);
    }

    printf("GeoTIFF file created successfully\n");

    // Cleanup
    GDALClose(hOutput);
    GDALClose(hDataset);

    end = clock();

    cpu_time_used = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("Time taken: %.2f seconds\n", cpu_time_used);

    return 0;
}
