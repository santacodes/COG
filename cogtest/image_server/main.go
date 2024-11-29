package main

import (
	"github.com/gofiber/fiber/v2"
	"log"
	"os"
	"path/filepath"
)

const COGDir = "./image" // Directory where your COG files are stored

// ServeCOG serves the COG file from the COGDir
func serveCOG(c *fiber.Ctx) error {
	// Get the filename from the URL path
	filename := c.Params("filename")
	filePath := filepath.Join(COGDir, filename)

	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return fiber.NewError(fiber.StatusNotFound, "File not found")
	}

	// Set the content type as application/octet-stream for generic binary data (can be changed to TIFF if needed)
	c.Set("Content-Type", "application/octet-stream")

	// Serve the file as a static file
	return c.SendFile(filePath)
}

func main() {
	// Initialize Fiber app
	app := fiber.New()

	// Serve static COG files from the directory
	app.Get("/cog/:filename", serveCOG)

	// Start the server with HTTPS (replace with your actual cert and key files)
	certFile := "./server.crt"
	keyFile := "./server.key"

	// Start the Fiber server on port 443 (HTTPS)
	log.Fatal(app.ListenTLS(":443", certFile, keyFile))
}
