# Variables
CC = gcc
GO = go
CFLAGS = -fPIC -I./gdal/c_bindings -I/usr/include/gdal
LDFLAGS = -L./gdal/c_bindings/build -linsat_bindings -L/usr/lib -lgdal -lhdf5
BUILD_DIR = gdal/c_bindings/build
C_SRCS = gdal/c_bindings/insat_metadata.c gdal/c_bindings/merge_tiff.c gdal/c_bindings/toGeoTiff.c
C_OBJS = $(patsubst gdal/c_bindings/%.c,$(BUILD_DIR)/%.o,$(C_SRCS))
C_LIB = $(BUILD_DIR)/libinsat_bindings.so
GO_OUTPUT = cogserver

# Default target
.PHONY: all clean run
all: $(C_LIB) $(GO_OUTPUT)

# Compile the shared library
$(C_LIB): $(C_OBJS)
	@echo "Building shared library: $@"
	$(CC) -shared -o $@ $^ $(LDFLAGS)

# Compile C source files to object files
$(BUILD_DIR)/%.o: gdal/c_bindings/%.c | $(BUILD_DIR)
	@echo "Compiling C source: $<"
	$(CC) $(CFLAGS) -c $< -o $@

# Create the build directory if it doesn't exist
$(BUILD_DIR):
	@echo "Creating build directory: $@"
	mkdir -p $(BUILD_DIR)

# Build the Go binary
$(GO_OUTPUT): main.go $(C_LIB)
	@echo "Building Go binary: $@"
	LD_LIBRARY_PATH=$(BUILD_DIR) $(GO) build -o $@ ./main.go

# Clean up build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR) $(GO_OUTPUT)

# Run the program
run: all
	@echo "Running the program..."
	LD_LIBRARY_PATH=$(BUILD_DIR) ./$(GO_OUTPUT)

