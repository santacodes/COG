import h5py

def print_h5_metadata(h5_file_path):
    """
    Print all metadata (attributes) with their keys from an HDF5 file.

    Parameters:
        h5_file_path (str): Path to the HDF5 file.
    """
    with h5py.File(h5_file_path, 'r') as hdf:
        print(f"Inspecting metadata in: {h5_file_path}\n")
        # Recursively print datasets and their attributes
        def print_attrs(name, obj):
            print(f"Dataset/Group: {name}")
            for key, value in obj.attrs.items():
                print(f"  Attribute - Key: {key}, Value: {value}")
            print("-" * 40)
        
        # Traverse the entire file structure
        hdf.visititems(print_attrs)

# Example usage
h5_file_path = "/home/jayavishnu/Documents/1738SIH/geoTIFF/COG/pipeline/SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5"
print_h5_metadata(h5_file_path)
