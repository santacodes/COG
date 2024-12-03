package fiberhttp

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"log"
	"net/http"
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

	// Open the file for streaming
	file, err := os.Open(filePath)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Unable to open file")
	}
	defer file.Close()

	// Get file info for content length and last modified headers
	fileInfo, err := file.Stat()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Unable to retrieve file info")
	}

	// Set HTTP headers for COG streaming
	c.Set("Content-Type", "image/tiff")             // Correct MIME type for TIFF
	c.Set("Accept-Ranges", "bytes")                // Enable range requests
	c.Set("Content-Length", string(fileInfo.Size())) // File size in bytes
	c.Set("Cache-Control", "public, max-age=86400") // Caching for one day
	c.Set("Last-Modified", fileInfo.ModTime().UTC().Format(http.TimeFormat))

	// Serve the file, handling range requests automatically
	return c.SendFile(filePath)
}

func Run_COG() {
	// Initialize Fiber app
	app := fiber.New()

	// Enable CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Allow specific origins or replace "*" with your domain
		AllowHeaders: "Origin, Content-Type, Accept, Range",
	}))

	// Serve static COG files from the directory
	app.Get("/cog/:filename", serveCOG)

	// Start the server with HTTPS (replace with your actual cert and key files)
	certFile := "./server.crt"
	keyFile := "./server.key"

	// Ensure the cert and key files exist before starting the server
	if _, err := os.Stat(certFile); os.IsNotExist(err) {
		log.Fatalf("Certificate file not found: %s", certFile)
	}
	if _, err := os.Stat(keyFile); os.IsNotExist(err) {
		log.Fatalf("Key file not found: %s", keyFile)
	}

	// Start the Fiber server on port 8443 (HTTPS)
	log.Println("Starting HTTPS server on port 8443...")
	log.Fatal(app.ListenTLS(":8443", certFile, keyFile))
}
