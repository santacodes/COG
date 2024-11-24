# Variables
CC = gcc
GO = go
CFLAGS = -I/usr/include/gdal
LDFLAGS = -L/usr/lib -lgdal -lhdf5
C_OUTPUT = c_bindings/libinsat_bindings.so
GO_OUTPUT = cog

# C source files
C_SRCS = c_bindings/insat_metadata.c c_bindings/toGeoTiff.c
C_OBJS = $(C_SRCS:.c=.o)

# Targets
.PHONY: all clean run

# Default target
all: $(C_OUTPUT) $(GO_OUTPUT)

# Compile the shared C library
$(C_OUTPUT): $(C_OBJS)
	$(CC) -shared -o $@ $^ $(LDFLAGS)

# Compile the C sources into object files
%.o: %.c
	$(CC) -fPIC -c $< $(CFLAGS)

# Build the Go binary
$(GO_OUTPUT): main.go $(C_OUTPUT)
	CGO_CFLAGS="$(CFLAGS)" CGO_LDFLAGS="-L$(PWD)/c_bindings -linsat_bindings $(LDFLAGS)" $(GO) build -o $@ ./main.go

# Clean build artifacts
clean:
	rm -f $(C_OBJS) $(C_OUTPUT) $(GO_OUTPUT)

# Run the program
run: all
	LD_LIBRARY_PATH=$(PWD)/c_bindings ./$(GO_OUTPUT)

