#ifndef MIN_MAX_SIMD_H
#define MIN_MAX_SIMD_H

#include <stddef.h> // For size_t

/**
 * @brief Calculate the minimum and maximum values of a 2D array using SIMD.
 *
 * @param array Pointer to the flattened 2D array (row-major order).
 * @param rows Number of rows in the array.
 * @param cols Number of columns in the array.
 * @param min_val Pointer to store the minimum value.
 * @param max_val Pointer to store the maximum value.
 */
void get_min_max_2d(const float *array, size_t rows, size_t cols,
                    float *min_val, float *max_val);

#endif // MIN_MAX_SIMD_H

