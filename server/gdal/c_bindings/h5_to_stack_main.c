#include <hdf5.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <gdal.h>
#include <cpl_conv.h> // For CPLMalloc
#include "geo_attributes.h"
#include <time.h>


// Callback data structure to collect 3D dataset names
typedef struct {
    char dataset_names[100][256];
    int count;
} DatasetList;


// Callback function to find 3D datasets
herr_t find_3d_datasets_callback(hid_t group_id, const char *name, const H5L_info_t *info, void *operator_data) {
    DatasetList *datasets = (DatasetList *)operator_data;
    hid_t dataset_id, dataspace_id;
    int ndim;

    // Open the dataset
    dataset_id = H5Dopen(group_id, name, H5P_DEFAULT);
    if (dataset_id < 0) {
        fprintf(stderr, "Failed to open dataset: %s\n", name);
        return 0; // Continue iteration despite the error
    }

    // Get the dataspace and check its dimensionality
    dataspace_id = H5Dget_space(dataset_id);
    if (dataspace_id < 0) {
        fprintf(stderr, "Failed to get dataspace for dataset: %s\n", name);
        H5Dclose(dataset_id);
        return 0;
    }
    
    // Get the number of dimensions
    ndim = H5Sget_simple_extent_ndims(dataspace_id);
    if (ndim == 3) {
        // Add dataset name to the list if it is 3D
        strncpy(datasets->dataset_names[datasets->count], name, sizeof(datasets->dataset_names[datasets->count]) - 1);
        datasets->dataset_names[datasets->count][sizeof(datasets->dataset_names[datasets->count]) - 1] = '\0';
        datasets->count++;
    }

    // Close the dataspace and dataset
    H5Sclose(dataspace_id);
    H5Dclose(dataset_id);

    return 0; // Continue iteration
}

// Main function
int main() {
    
    const char *file_name = "3RIMG_04SEP2024_1015_L1C_ASIA_MER_V01R00.h5";
    hid_t file_id;
    herr_t status;
    DatasetList datasets = {0};
    int width = 1737, height = 1616; // Assuming constant dimensions for all subdatasets

    // Open the HDF5 file
    file_id = H5Fopen(file_name, H5F_ACC_RDONLY, H5P_DEFAULT);
    if (file_id < 0) {
        printf("Failed to open file: %s\n", file_name);
        return 1;
    }
        GeoAttributes attrs = fetch_geo_attributes(file_id);
       double geotransform[6];
    geotransform[0] = attrs.left_longitude;                             // Top left X
    geotransform[1] = (attrs.right_longitude - attrs.left_longitude);   // Pixel width
    geotransform[2] = 0;                                                // Rotation (X)
    geotransform[3] = attrs.upper_latitude;                             // Top left Y
    geotransform[4] = 0;                                                // Rotation (Y)
    geotransform[5] = -(attrs.upper_latitude - attrs.lower_latitude);   // Pixel height




    // Print the attributes in main
   printf("Datum: %s, Ellipsoid: %s, Left Longitude: %.2f, Right Longitude: %.2f, Upper Latitude: %.2f, Lower Latitude: %.2f\n",
           attrs.datum, attrs.ellipsoid, attrs.left_longitude, attrs.right_longitude, attrs.upper_latitude, attrs.lower_latitude);

    // Iterate to collect all 3D datasets
    if (H5Literate(file_id, H5_INDEX_NAME, H5_ITER_NATIVE, NULL, find_3d_datasets_callback, &datasets) < 0) {
        fprintf(stderr, "Failed to iterate over file\n");
        H5Fclose(file_id);
        return 1;
    }

    // Initialize GDAL and create output GeoTIFF
    GDALAllRegister();
    GDALDriverH hDriver = GDALGetDriverByName("GTiff");
    if (hDriver == NULL) {
        fprintf(stderr, "GDAL GeoTIFF driver not found\n");
        H5Fclose(file_id);
        return 1;
    }

    GDALDatasetH hOutput = GDALCreate(hDriver, "stack.tif", width, height, datasets.count, GDT_Float32, NULL);
    if (hOutput == NULL) {
        fprintf(stderr, "Failed to create stacked GeoTIFF\n");
        H5Fclose(file_id);
        return 1;
    }
    GDALSetGeoTransform(hOutput, geotransform);
            GDALSetProjection(hOutput, "EPSG:4326"); // Modify projection as needed
    // Process each dataset and add as a band to the output file
    clock_t start_time = clock();
    for (int i = 0; i < datasets.count; i++) {
        hid_t dataset_id = H5Dopen(file_id, datasets.dataset_names[i], H5P_DEFAULT);
        if (dataset_id < 0) {
            fprintf(stderr, "Failed to open dataset: %s\n", datasets.dataset_names[i]);
            continue;
        }

        hsize_t dims[3];
        H5Sget_simple_extent_dims(H5Dget_space(dataset_id), dims, NULL);
        float *data = (float *)malloc(dims[1] * dims[2] * sizeof(float));
        if (data == NULL) {
            fprintf(stderr, "Memory allocation failed for dataset: %s\n", datasets.dataset_names[i]);
            H5Dclose(dataset_id);
            continue;
        }

        // Read dataset
        status = H5Dread(dataset_id, H5T_NATIVE_FLOAT, H5S_ALL, H5S_ALL, H5P_DEFAULT, data);
        if (status < 0) {
            fprintf(stderr, "Failed to read dataset: %s\n", datasets.dataset_names[i]);
            free(data);
            H5Dclose(dataset_id);
            continue;
        }

        // Write data to the corresponding band in the GeoTIFF
        GDALRasterBandH hBand = GDALGetRasterBand(hOutput, i + 1);
        if (GDALRasterIO(hBand, GF_Write, 0, 0, width, height, data, width, height, GDT_Float32, 0, 0) != CE_None) {
            fprintf(stderr, "Failed to write data to band %d\n", i + 1);
        }
        GDALSetDescription(hBand, datasets.dataset_names[i]);
        printf("Added dataset %s to band %d\n", datasets.dataset_names[i], i + 1);

        free(data);
        H5Dclose(dataset_id);
    }

    GDALClose(hOutput);
    H5Fclose(file_id);
    printf("Stacked GeoTIFF created successfully: stack.tif\n");
    clock_t end_time = clock();

    // Calculate the runtime in seconds
    double runtime = (double)(end_time - start_time) / CLOCKS_PER_SEC;
    printf("Runtime: %.6f seconds\n", runtime);
    return 0;
}

// gcc -o get_sub get_sub.c geo_attributes.c -lhdf5 -I/usr/include/hdf5/serial -L/usr/lib/x86_64-linux-gnu/hdf5/serial -lgdal