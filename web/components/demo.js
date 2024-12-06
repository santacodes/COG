import GeoTIFF from 'geotiff';

async function readGeoTIFFMetadata(url) {
  try {
    // Fetch and parse the GeoTIFF file
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);

    // Get the first image in the GeoTIFF file
    const image = await tiff.getImage();

    // Retrieve metadata
    const width = image.get
    const height = image.getHeight();
    const origin = image.getOrigin(); // [x, y] of the top-left corner
    const resolution = image.getResolution(); // Pixel size (x, y)
    const extent = image.getBoundingBox(); // Extent of the image [xmin, ymin, xmax, ymax]
    const samplesPerPixel = image.getSamplesPerPixel(); // Number of bands

    // Log metadata
    console.log('Width:', width);
    console.log('Height:', height);
    console.log('Origin:', origin);
    console.log('Resolution (Pixel Size):', resolution);
    console.log('Extent:', extent);
    console.log('Bands:', samplesPerPixel);

    // Read the raster data
    const rasterData = await image.readRasters({ interleave: true });
    console.log('Raster Data:', rasterData);

    // Calculate min and max values
    const bandData = rasterData[0]; // Assuming single-band image
    const min = Math.min(...bandData);
    const max = Math.max(...bandData);

    console.log('Min Value:', min);
    console.log('Max Value:', max);

  } catch (error) {
    console.error('Error reading GeoTIFF metadata:', error);
  }
}

// Call the function with the URL of your GeoTIFF file
const url = 'http://127.0.0.1:8443/cog/IMG_MIR.tif';
readGeoTIFFMetadata(url);
