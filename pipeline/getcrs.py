import h5py

def extract_crs_from_h5(h5_file_path):
    """
    Extract the CRS from an HDF5 file based on Datum and Ellipsoid attributes.

    Parameters:
        h5_file_path (str): Path to the HDF5 file.

    Returns:
        str: The CRS EPSG code if found, or a message indicating it couldn't be determined.
    """
    try:
        with h5py.File(h5_file_path, 'r') as hdf:
            # Access root group attributes
            root = hdf["/"]
            datum = root.attrs.get("Datum", b"").decode("utf-8")
            ellipsoid = root.attrs.get("Ellipsoid", b"").decode("utf-8")
            
            # Print the found attributes
            print(f"Datum: {datum}")
            print(f"Ellipsoid: {ellipsoid}")
            
            # Check if both are WGS84
            if datum == "WGS84" and ellipsoid == "WGS84":
                return "EPSG:4326 (WGS 84)"
            else:
                return "CRS could not be determined from the given attributes."
    except FileNotFoundError:
        return f"Error: File not found at {h5_file_path}"
    except Exception as e:
        return f"An error occurred: {e}"

# Example usage
h5_file_path = "./SIH2024/3RIMG_04SEP2024_1015_L1B_STD_V01R00.h5"  # Replace with the correct path to your .h5 file
crs = extract_crs_from_h5(h5_file_path)
print(f"Determined CRS: {crs}")
