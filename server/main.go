package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/santacodes/COG/fiberhttp"
	"github.com/santacodes/COG/gdal"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {

	app := fiber.New()

	app.Use(logger.New())
	// Enable CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Allow specific origins or replace "*" with your domain
		AllowHeaders: "Origin, Content-Type, Accept, Range",
	}))
	fiberhttp.Run_COG(app)
	fiberhttp.WeatherServer(app)
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
	// Input and output directories
	inputDir := "../pipeline/SIH2024/" // Directory containing COG files
	outputDir := "stacked_new.tif"     // Directory to store processed files

	// Ensure output directory exists
	//if _, err := os.Stat(outputDir); os.IsNotExist(err) {
	//	if err := os.Mkdir(outputDir, os.ModePerm); err != nil {
	//		log.Fatalf("Failed to create output directory: %s", outputDir)
	//	}
	//}

	// Iterate over files in the input directory
	err := filepath.Walk(inputDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Check if the file contains "L1C" in its name and has a .h5 extension
		if !info.IsDir() && strings.Contains(info.Name(), "L1C") && strings.HasSuffix(info.Name(), ".h5") {
			log.Printf("Processing dataset: %s -> %s", info.Name(), outputDir)
			COG.PipelineMainL1C(path, outputDir)
		}
		return nil
	})

	if err != nil {
		log.Fatalf("Error while walking through input directory: %v", err)
	}

	log.Println("Finished processing all datasets.")

	//COG.PipelineMain("./3RIMG_04SEP2024_1545_L1C_ASIA_MER_V01R00.h5", "outputs")
	// Start the Fiber server on port 8443 (HTTPS)
	log.Println("Loaded and starting HTTPS server on port 8443 for COG and weather proxy...")
	log.Fatal(app.Listen(":8443")) // Change this to app.ListenTLS(":8443", certFile, keyFile) for HTTPS

	// Print the metadata
}
