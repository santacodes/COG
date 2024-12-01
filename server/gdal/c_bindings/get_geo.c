#include <hdf5.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Define a struct to store the attribute values
typedef struct {
    char datum[50];
    char ellipsoid[50];
    float left_longitude;
    float right_longitude;
    float upper_latitude;
    float lower_latitude;
} GeoAttributes;
////////////////////////////////////////////
// Function to read a string attribute
int read_string_attribute(hid_t file_id, const char *attr_name, char *dest, size_t dest_size) {
    hid_t attr_id, type_id;
    herr_t status;

    // Open the attribute
    attr_id = H5Aopen(file_id, attr_name, H5P_DEFAULT);
    if (attr_id < 0) return -1;

    // Get the attribute's data type
    type_id = H5Aget_type(attr_id);
    H5T_class_t type_class = H5Tget_class(type_id);

    if (type_class == H5T_STRING) {
        size_t size = H5Aget_storage_size(attr_id);
        if (size >= dest_size) size = dest_size - 1; // Ensure no buffer overflow
        status = H5Aread(attr_id, type_id, dest);
        if (status >= 0) dest[size] = '\0'; // Null-terminate the string
    } else {
        status = -1; // Unsupported type
    }

    // Close resources
    H5Tclose(type_id);
    H5Aclose(attr_id);

    return status;
}

// Function to read a double attribute
int read_double_attribute(hid_t file_id, const char *attr_name, float *value) {
    hid_t attr_id, type_id;
    herr_t status;

    // Open the attribute
    attr_id = H5Aopen(file_id, attr_name, H5P_DEFAULT);
    if (attr_id < 0) return -1;

    // Get the attribute's data type
    type_id = H5Aget_type(attr_id);
    H5T_class_t type_class = H5Tget_class(type_id);

    if (type_class == H5T_FLOAT && H5Tget_size(type_id) == sizeof(float)) {
        status = H5Aread(attr_id, type_id, value);
    } else {
        status = -1; // Unsupported type
    }

    // Close resources
    H5Tclose(type_id);
    H5Aclose(attr_id);

    return status;
}

// Function to fetch all required attributes
GeoAttributes fetch_geo_attributes(hid_t file_id) {
    GeoAttributes attrs = {0};

    // Read each required attribute
    read_string_attribute(file_id, "Datum", attrs.datum, sizeof(attrs.datum));
    read_string_attribute(file_id, "Ellipsoid", attrs.ellipsoid, sizeof(attrs.ellipsoid));
    read_double_attribute(file_id, "left_longitude", &attrs.left_longitude);
    read_double_attribute(file_id, "right_longitude", &attrs.right_longitude);
    read_double_attribute(file_id, "upper_latitude", &attrs.upper_latitude);
    read_double_attribute(file_id, "lower_latitude", &attrs.lower_latitude);

    return attrs;
}

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

    // Fetch the geo-referenced attributes
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

    // Close the file
    status = H5Fclose(file_id);
    if (status < 0) {
        printf("Failed to close file.\n");
    }

    return 0;
}
