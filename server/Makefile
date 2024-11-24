# Variables
CC = gcc
GO = go
CFLAGS = -I/usr/include/gdal
LDFLAGS = -L/usr/lib -lgdal
C_OUTPUT = c_bindings/insat_metadata.so
GO_OUTPUT = cog_server

# Targets
.PHONY: all clean run

# Default target
all: $(C_OUTPUT) $(GO_OUTPUT)

# Compile the shared C library
$(C_OUTPUT): c_bindings/insat_metadata.c c_bindings/insat_metadata.h
	$(CC) -shared -o $@ $< $(CFLAGS) $(LDFLAGS)

# Build the Go binary
$(GO_OUTPUT): main.go $(C_OUTPUT)
	$(GO) build -o $@ ./main.go

# Clean build artifacts
clean:
	rm -f $(C_OUTPUT) $(GO_OUTPUT)

# Run the program
run: all
	LD_LIBRARY_PATH=c_bindings ./$(GO_OUTPUT)

