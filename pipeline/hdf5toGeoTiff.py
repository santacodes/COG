import h5py
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import numpy as np
# Input and output file paths

hdf5_file = "./SIH2024/3RIMG_04SEP2024_1045_L1C_ASIA_MER_V01R00.h5"
image_files=[]

# Read the HDF5 file
with h5py.File(hdf5_file, 'r') as hdf:


    metadata = hdf["/"].attrs
    #left, bottom, right, top                # Bounding box
    top=metadata.get('upper_latitude', 0) 
    bottom=metadata.get('lower_latitude', 0) 
    left=metadata.get('left_longitude', 0) 
    right=metadata.get('right_longitude', 0) 
    print(top, bottom, left, right)
    crs = CRS.from_epsg(4326)  # WGS84 CRS
        
    if not top or not right or not left or not right:
            raise ValueError("Required georeferencing metadata is missing in the HDF5 file.")
    


    for key in hdf.keys():
        # print(key)
        data = hdf[key][:]
        print(key,data.shape)
        if(data.ndim==3):
            dataset = np.squeeze(data, axis=0)
        
        
            width, height = dataset.shape  # Dimensions
        
        
            # Compute the transform
            transform = from_bounds(left, bottom, right, top, width, height)
            output_tiff_path="./outputs/"+key+"_L1C.tif"
            image_files.append(output_tiff_path)
            # Write the dataset to a GeoTIFF file
            with rasterio.open(
                output_tiff_path,
                'w',
                driver='GTiff',
                height=dataset.shape[0],
                width=dataset.shape[1],
                count=1,  # Single band
                dtype=dataset.dtype,
                crs=crs,
                transform=transform,
            ) as dst:
                dst.write(dataset, 1)  # Write the dataset to band 1

            print(f"GeoTIFF file created successfully: {output_tiff_path}")
            
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
output_file = './outputs/'+"demostack.tif"
with rasterio.open(output_file, "w", **meta) as dst:
    for idx, ds in enumerate(datasets, start=1):
        dst.write(ds.read(1), idx)  # Write each band to the output

# Close datasets
for ds in datasets:
    ds.close()

print(f"Stacked TIFF saved as {output_file}")
