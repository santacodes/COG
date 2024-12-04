from http.server import SimpleHTTPRequestHandler
import socketserver
import os

# Define the port to host on
PORT = 9090
IMAGE_DIR = "/home/jayavishnu/Documents/1738SIH/COG/pipeline/outputs/"  # Directory containing the image(s)

# Change the working directory to serve the images
os.chdir(IMAGE_DIR)


class CORSRequestHandler(SimpleHTTPRequestHandler):
    """Custom request handler to add CORS headers."""

    def end_headers(self):
        # Add the CORS header
        self.send_header("Access-Control-Allow-Origin", "*")
        # Call the original method to finish the headers
        super().end_headers()


# Start the server
with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print(f"Hosting files from: {os.getcwd()}")
    httpd.serve_forever()
