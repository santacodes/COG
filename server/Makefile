# Variables
CC = gcc
GO = go
CFLAGS = -fPIC -I/usr/include/gdal
LDFLAGS = -L./build -linsat_bindings -L/usr/lib -lgdal -lhdf5
BUILD_DIR = build
C_SRCS = c_bindings/insat_metadata.c c_bindings/merge_tiff.c c_bindings/toGeoTiff.c
C_OBJS = $(patsubst c_bindings/%.c,$(BUILD_DIR)/%.o,$(C_SRCS))
C_LIB = $(BUILD_DIR)/libinsat_bindings.so
GO_OUTPUT = cog_server

# Default target
.PHONY: all clean run
all: $(C_LIB) $(GO_OUTPUT)

# Compile the shared library
$(C_LIB): $(C_OBJS)
	$(CC) -shared -o $@ $^ $(LDFLAGS)

# Compile C source files to object files
$(BUILD_DIR)/%.o: c_bindings/%.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Create the build directory if it doesn't exist
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Build the Go binary
$(GO_OUTPUT): main.go $(C_LIB)
	LD_LIBRARY_PATH=$(BUILD_DIR) $(GO) build -o $@ ./main.go

# Clean up build artifacts
clean:
	rm -rf $(BUILD_DIR) $(GO_OUTPUT)

# Run the program
run: all
	LD_LIBRARY_PATH=$(BUILD_DIR) ./$(GO_OUTPUT)

