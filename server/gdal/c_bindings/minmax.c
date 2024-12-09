#include <float.h>
#include <immintrin.h>

// Function to calculate min and max of a 2D array
void get_min_max_2d(const float *array, size_t rows, size_t cols,
                    float *min_val, float *max_val) {
  __m256 min_vec = _mm256_set1_ps(FLT_MAX);  // Initialize min vector
  __m256 max_vec = _mm256_set1_ps(-FLT_MAX); // Initialize max vector

  size_t total_elements = rows * cols; // Flatten the 2D array size
  size_t i = 0;

  // Process array in chunks of 8 elements (SIMD width for AVX)
  for (; i + 8 <= total_elements; i += 8) {
    __m256 data = _mm256_loadu_ps(&array[i]); // Load 8 floats
    min_vec = _mm256_min_ps(min_vec, data);   // Compute min
    max_vec = _mm256_max_ps(max_vec, data);   // Compute max
  }

  // Reduce SIMD vectors to scalar values
  float min_values[8], max_values[8];
  _mm256_storeu_ps(min_values, min_vec);
  _mm256_storeu_ps(max_values, max_vec);

  *min_val = FLT_MAX;
  *max_val = -FLT_MAX;
  for (int j = 0; j < 8; ++j) {
    if (min_values[j] < *min_val)
      *min_val = min_values[j];
    if (max_values[j] > *max_val)
      *max_val = max_values[j];
  }

  // Process remaining elements
  for (; i < total_elements; ++i) {
    if (array[i] < *min_val)
      *min_val = array[i];
    if (array[i] > *max_val)
      *max_val = array[i];
  }
}

#include <stdio.h>

// int main() {
//  Example 2D array (flattened into a 1D array for simplicity)
// float array[3][4] = {
//    {1.0, 2.0, 3.0, 4.0}, {5.0, 6.0, 7.0, 8.0}, {9.0, 10.0, 11.0, 12.0}};

// float minmax[2];
// get_min_max_2d((const float *)array, 3, 4, &minmax[0], &minmax[1]);

// printf("Min: %.2f, Max: %.2f\n", minmax[0], minmax[1]);
// return *minmax;
//}
