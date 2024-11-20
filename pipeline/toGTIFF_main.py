import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import h5py
import numpy as np
def convert_h5_to_geotiff_auto(h5_file_path, dataset_path, output_tiff_path):
    """
    Convert an HDF5 file to a GeoTIFF, extracting metadata automatically.

    Parameters:
        h5_file_path (str): Path to the input HDF5 file.
        dataset_path (str): Path within the HDF5 file to the dataset (e.g., "//IMG_MIR").
        output_tiff_path (str): Path to save the output GeoTIFF file.
    
    Returns:
        None: Writes a GeoTIFF file to the specified path.
    """
    with h5py.File(h5_file_path, 'r') as hdf:
        #print(h5py.File.keys())
        # Extract the dataset
        dataset = hdf[dataset_path][:]
        dataset = np.squeeze(dataset, axis=0)
        # Extract metadata
        metadata = hdf["/"].attrs
       
        #epsg_code = metadata.get('EPSGCode', 4326)  # Replace 'EPSGCode' with the actual attribute name
        
        # Handle missing metadata gracefully
        
        # Define the CRS and transformation
        #left, bottom, right, top                # Bounding box
        top=metadata.get('upper_latitude', 0) 
        bottom=metadata.get('lower_latitude', 0) 
        left=metadata.get('left_longitude', 0) 
        right=metadata.get('right_longitude', 0) 
        print(top, bottom, left, right)
        width, height = dataset.shape  # Dimensions
        crs = CRS.from_epsg(4326)  # WGS84 CRS
        
        if not top or not right or not left or not right:
            raise ValueError("Required georeferencing metadata is missing in the HDF5 file.")
        
            # Compute the transform
        transform = from_bounds(left, bottom, right, top, width, height)


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
convert_h5_to_geotiff_auto("./SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5", "IMG_MIR", "./outputs/demo_L1B.tif")
