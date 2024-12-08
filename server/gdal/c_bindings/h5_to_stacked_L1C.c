#include <hdf5.h>
#include <gdal.h>
#include <stdio.h>
#include <stdlib.h>
#include "geo_attributes.h"

static const char *DATASET_NAMES[] = {"IMG_MIR", "IMG_SWIR", "IMG_TIR1", "IMG_TIR2", "IMG_VIS", "IMG_WV"};
static const int DATASET_COUNT = 6; // Number of datasets

int process_dataset(hid_t file_id, const char *dataset_name, GDALDatasetH hOutput, int band_index) {
    hid_t dataset_id = H5Dopen(file_id, dataset_name, H5P_DEFAULT);
    if (dataset_id < 0) {
        fprintf(stderr, "Failed to open dataset: %s\n", dataset_name);
        return -1;
    }

    // Get dataset dimensions
    hsize_t dims[3];
    H5Sget_simple_extent_dims(H5Dget_space(dataset_id), dims, NULL);
    float *data = (float *)malloc(dims[1] * dims[2] * sizeof(float));
    // printf("%s %s",dims[1],dims[2]);
    printf("Dataset: %s, Width: %llu, Height: %llu\n", dataset_name, dims[2], dims[1]);

    if (!data) {
        fprintf(stderr, "Memory allocation failed for dataset: %s\n", dataset_name);
        H5Dclose(dataset_id);
        return -1;
    }

    // Read dataset
    if (H5Dread(dataset_id, H5T_NATIVE_FLOAT, H5S_ALL, H5S_ALL, H5P_DEFAULT, data) < 0) {
        fprintf(stderr, "Failed to read dataset: %s\n", dataset_name);
        free(data);
        H5Dclose(dataset_id);
        return -1;
    }

    // Write to GeoTIFF band
    GDALRasterBandH hBand = GDALGetRasterBand(hOutput, band_index);
    if (GDALRasterIO(hBand, GF_Write, 0, 0, dims[2], dims[1], data, dims[2], dims[1], GDT_Float32, 0, 0) != CE_None) {
        fprintf(stderr, "Failed to write dataset: %s to band %d\n", dataset_name, band_index);
    }

    GDALSetDescription(hBand, dataset_name);
    free(data);
    H5Dclose(dataset_id);
    return 0;
}

int process_hdf5_to_cog(const char *file_name, const char *output_file, 
                        const char *dataset_names[], int dataset_count) {
    hid_t file_id = H5Fopen(file_name, H5F_ACC_RDONLY, H5P_DEFAULT);
    if (file_id < 0) {
        fprintf(stderr, "Failed to open HDF5 file: %s\n", file_name);
        return -1;
    }

    // Fetch geographic attributes
    GeoAttributes attrs = fetch_geo_attributes(file_id);
    printf("Datum: %s\n", attrs.datum);
    printf("Ellipsoid: %s\n", attrs.ellipsoid);
    printf("Left Longitude: %.2f\n", attrs.left_longitude);
    printf("Right Longitude: %.2f\n", attrs.right_longitude);
    printf("Upper Latitude: %.2f\n", attrs.upper_latitude);
    printf("Lower Latitude: %.2f\n", attrs.lower_latitude);

    double geotransform[6] = {
        attrs.left_longitude,                                      // Top-left X coordinate
        (attrs.right_longitude - attrs.left_longitude) / 1737,    // Pixel width (longitude resolution)
        0,                                                       // Rotation (X axis)
        attrs.upper_latitude,                                     // Top-left Y coordinate
        0,                                                       // Rotation (Y axis)
        -(attrs.upper_latitude - attrs.lower_latitude) / 1616    // Pixel height (latitude resolution)
    };

    for (int i = 0; i < 6; i++) {
        printf("Geotransform[%d]: %.6f\n", i, geotransform[i]);
    }

    // Initialize GDAL and create COG output
    GDALAllRegister();
    GDALDriverH hDriver = GDALGetDriverByName("GTiff");
    if (!hDriver) {
        fprintf(stderr, "GDAL COG driver not found\n");
        H5Fclose(file_id);
        return -1;
    }

    char *creation_options[] = {
        "TILED=YES", 
        "COMPRESS=LZW", 
        NULL
    };

    GDALDatasetH hOutput = GDALCreate(hDriver, output_file, 1737, 1616, dataset_count, GDT_Float32, creation_options);
    if (!hOutput) {
        fprintf(stderr, "Failed to create COG\n");
        H5Fclose(file_id);
        return -1;
    }

    GDALSetGeoTransform(hOutput, geotransform);
    GDALSetProjection(hOutput, "EPSG:4326");

    // Process each dataset
    for (int i = 0; i < dataset_count; i++) {
        if (process_dataset(file_id, dataset_names[i], hOutput, i + 1) != 0) {
            fprintf(stderr, "Error processing dataset: %s\n", dataset_names[i]);
        }
    }

    // Build overviews for better performance
    int overviewLevels[] = {2, 4};
    if (GDALBuildOverviews(hOutput, "AVERAGE", 2, overviewLevels, 0, NULL, NULL, NULL) != CE_None) {
        fprintf(stderr, "Failed to build overviews.\n");
    }

    // Clean up
    GDALClose(hOutput);
    H5Fclose(file_id);
    return 0;
}

int main() {
    const char *file_name = "../../../SIH2024/3RIMG_04SEP2024_1015_L1C_ASIA_MER_V01R00.h5";
    const char *output_file = "stack.tif";

    // Process HDF5 file and create GeoTIFF
    if (process_hdf5_to_cog(file_name, output_file, DATASET_NAMES, DATASET_COUNT) != 0) {
        fprintf(stderr, "Failed to process file: %s\n", file_name);
        return 1;
    }

    printf("GeoTIFF created successfully: %s\n", output_file);
    return 0;
}

// gcc -o get_sub get_sub.c geo_attributes.c -lhdf5 -I/usr/include/hdf5/serial -L/usr/lib/x86_64-linux-gnu/hdf5/serial -lgdal
