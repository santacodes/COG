package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/santacodes/COG/fiberhttp"
	"log"
	"os"
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

	// Start the Fiber server on port 8443 (HTTPS)
	log.Println("Loaded and starting HTTPS server on port 8443 for COG and weather proxy...")
	log.Fatal(app.Listen(":8443")) // Change this to app.ListenTLS(":8443", certFile, keyFile) for HTTPS

	// Print the metadata
}
