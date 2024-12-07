package fiberhttp

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/valyala/fasthttp"
)

// startServer sets up and starts the Fiber server
func WeatherServer(app *fiber.App) {
	// Create a new Fiber app

	// Add logging middleware for debugging

	// Define the proxy route
	app.Get("/weather", func(c *fiber.Ctx) error {
		// Extract latitude and longitude from query parameters
		lat := c.Query("lat")
		lon := c.Query("lon")

		// Validate input
		if lat == "" || lon == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Latitude and longitude are required parameters",
			})
		}

		// Construct the target API URL
		targetURL := "https://mosdac.gov.in/apiweather1/weather?lon=" + lon + "&lat=" + lat

		// Make a GET request to the target API
		req := fasthttp.AcquireRequest()
		defer fasthttp.ReleaseRequest(req)
		res := fasthttp.AcquireResponse()
		defer fasthttp.ReleaseResponse(res)

		req.SetRequestURI(targetURL)
		req.Header.SetMethod(fiber.MethodGet)

		// Send the request
		if err := fasthttp.Do(req, res); err != nil {
			log.Println("Error while forwarding request:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch data from the API",
			})
		}

		// Copy the response from the target API to the client
		c.Response().SetStatusCode(res.StatusCode())
		c.Response().SetBody(res.Body())
		return nil
	})

	// Start the server
	log.Println("Weather Server running on http://localhost:3000/weather")
}
