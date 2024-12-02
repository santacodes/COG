#ifndef GEO_ATTRIBUTES_H
#define GEO_ATTRIBUTES_H

#include <hdf5.h>

// Define the GeoAttributes struct
typedef struct {
    char datum[50];
    char ellipsoid[50];
    float left_longitude;
    float right_longitude;
    float upper_latitude;
    float lower_latitude;
} GeoAttributes;

// Function prototype for fetch_geo_attributes
GeoAttributes fetch_geo_attributes(hid_t file_id);

#endif // GEO_ATTRIBUTES_H
