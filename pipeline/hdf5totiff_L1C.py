import h5py
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import numpy as np
# Input and output file paths
unique_name="3RIMG_04SEP2024_1015_L1C_ASIA_MER_V01R00"
hdf5_file = "./SIH2024/"+unique_name+".h5"

image_files=[]
# Read the HDF5 file
with h5py.File(hdf5_file, 'r') as hdf:
    for key in hdf.keys():
        # print(key)
        data = hdf[key][:]
        print(key,data.shape)
        if(data.ndim==3):
            dataset = np.squeeze(data, axis=0)
    
            print(dataset)
            height, width = dataset.shape
            # Access the desired subdataset (IMG_MIR)
            
            
            # Metadata from the file
            left, bottom, right, top = 44.5, -10, 110, 45.5  # Bounding box
            width, height = dataset.shape  # Dimensions
            crs = CRS.from_epsg(4326)  # WGS84 CRS
            
            # Compute the transform
            transform = from_bounds(left, bottom, right, top, width, height)
            loc=key+"_L1C.tif"
            image_files.append(loc)
        # Write to GeoTIFF
            with rasterio.open(
                loc,
                'w',
                driver='GTiff',
                height=height,
                width=width,
                count=1,
                dtype=dataset.dtype,
                crs=crs,
                transform=transform
            ) as dst:
                dst.write(dataset, 1)

            print(f"GeoTIFF saved to {loc}")
print(image_files)
# images = [imageio.v2.imread(img) for img in image_files]

# Save stacked images into one TIFF file
datasets = [rasterio.open(f) for f in image_files]

# Check that all images have the same dimensions
width, height = datasets[0].width, datasets[0].height
if not all(ds.width == width and ds.height == height for ds in datasets):
    raise ValueError("All input images must have the same dimensions.")

# Metadata for the output file
meta = datasets[0].meta.copy()
meta.update({"count": len(datasets), "dtype": datasets[0].dtypes[0]})

# Write to a new multi-band TIFF
output_file = unique_name+".tif"
with rasterio.open(output_file, "w", **meta) as dst:
    for idx, ds in enumerate(datasets, start=1):
        dst.write(ds.read(1), idx)  # Write each band to the output

# Close datasets
for ds in datasets:
    ds.close()

print(f"Stacked TIFF saved as {output_file}")
