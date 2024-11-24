import h5py


def print_root_metadata(h5_file_path):
    """
    Print all metadata (attributes) in the root group (/) of an HDF5 file.

    Parameters:
        h5_file_path (str): Path to the HDF5 file.
    """
    try:
        with h5py.File(h5_file_path, "r") as hdf:
            print(f"Inspecting metadata in root group (/) of: {h5_file_path}\n")
            root = hdf["/"]
            for key, value in root.attrs.items():
                print(f"Attribute - Key: {key}, Value: {value}")
    except FileNotFoundError:
        print(f"Error: File not found at {h5_file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")


# Example usage
h5_file_path = "./SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5"

print_root_metadata(h5_file_path)
