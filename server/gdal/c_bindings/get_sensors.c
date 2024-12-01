#include <hdf5.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Callback function to filter datasets with 3 dimensions
herr_t find_3d_datasets_callback(hid_t group_id, const char *name, const H5L_info_t *info, void *operator_data) {
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
        // Print the dataset name if it has 3 dimensions
        printf("3D Subdataset: %s\n", name);
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

    // Open the HDF5 file
    file_id = H5Fopen(file_name, H5F_ACC_RDONLY, H5P_DEFAULT);
    if (file_id < 0) {
        printf("Failed to open file: %s\n", file_name);
        return 1;
    }

    // Iterate over the root group to find 3D subdatasets
    if (H5Literate(file_id, H5_INDEX_NAME, H5_ITER_NATIVE, NULL, find_3d_datasets_callback, NULL) < 0) {
        fprintf(stderr, "Failed to iterate over file\n");
        H5Fclose(file_id);
        return 1;
    }

    // Close the file
    status = H5Fclose(file_id);
    if (status < 0) {
        printf("Failed to close file.\n");
    }

    return 0;
}
