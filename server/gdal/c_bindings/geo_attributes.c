#include "geo_attributes.h"
#include <string.h>

// Function to read a string attribute
int read_string_attribute(hid_t file_id, const char *attr_name, char *dest, size_t dest_size) {
    hid_t attr_id, type_id;
    herr_t status;

    attr_id = H5Aopen(file_id, attr_name, H5P_DEFAULT);
    if (attr_id < 0) return -1;

    type_id = H5Aget_type(attr_id);
    H5T_class_t type_class = H5Tget_class(type_id);

    if (type_class == H5T_STRING) {
        size_t size = H5Aget_storage_size(attr_id);
        if (size >= dest_size) size = dest_size - 1;
        status = H5Aread(attr_id, type_id, dest);
        if (status >= 0) dest[size] = '\0';
    } else {
        status = -1;
    }

    H5Tclose(type_id);
    H5Aclose(attr_id);
    return status;
}

// Function to read a double attribute
int read_double_attribute(hid_t file_id, const char *attr_name, float *value) {
    hid_t attr_id, type_id;
    herr_t status;

    attr_id = H5Aopen(file_id, attr_name, H5P_DEFAULT);
    if (attr_id < 0) return -1;

    type_id = H5Aget_type(attr_id);
    H5T_class_t type_class = H5Tget_class(type_id);

    if (type_class == H5T_FLOAT && H5Tget_size(type_id) == sizeof(float)) {
        status = H5Aread(attr_id, type_id, value);
    } else {
        status = -1;
    }

    H5Tclose(type_id);
    H5Aclose(attr_id);
    return status;
}

// Implementation of fetch_geo_attributes
GeoAttributes fetch_geo_attributes(hid_t file_id) {
    GeoAttributes attrs = {0};
    read_string_attribute(file_id, "Datum", attrs.datum, sizeof(attrs.datum));
    read_string_attribute(file_id, "Ellipsoid", attrs.ellipsoid, sizeof(attrs.ellipsoid));
    read_double_attribute(file_id, "left_longitude", &attrs.left_longitude);
    read_double_attribute(file_id, "right_longitude", &attrs.right_longitude);
    read_double_attribute(file_id, "upper_latitude", &attrs.upper_latitude);
    read_double_attribute(file_id, "lower_latitude", &attrs.lower_latitude);
    return attrs;
}
