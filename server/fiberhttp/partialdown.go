package fiberhttp

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/valyala/fasthttp"
)

func StartPartial(app *fiber.App) {

	// Define the `/partial` proxy endpoint
	app.Post("/partial", func(c *fiber.Ctx) error {
		// Parse the incoming JSON request body
		reqBody := c.Body()
		if len(reqBody) == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Request body is empty",
			})
		}

		// Define the target API URL
		targetURL := "http://127.0.0.1:8553/api/download-raster"

		// Create a new fasthttp request and response
		req := fasthttp.AcquireRequest()
		defer fasthttp.ReleaseRequest(req)
		res := fasthttp.AcquireResponse()
		defer fasthttp.ReleaseResponse(res)

		// Set up the target API request
		req.SetRequestURI(targetURL)
		req.Header.SetMethod(fiber.MethodPost)
		req.Header.SetContentType("application/json")
		req.SetBody(reqBody)

		// Forward the request to the target API
		if err := fasthttp.Do(req, res); err != nil {
			log.Println("Error forwarding request:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch data from the target API",
			})
		}

		// Send back the response from the target API
		c.Set("Content-Type", string(res.Header.Peek("Content-Type")))
		return c.Status(res.StatusCode()).Send(res.Body())
	})

	// Start the Fiber server
	log.Println("Partial download proxy is running on http://127.0.0.1:3000")
}
