package COG

import (
	"bufio"
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

// runGdalInfo executes the gdalinfo command on the given file path and returns the output as a string.
func RunGdalInfo(filePath string) (string, error) {
	cmd := exec.Command("gdalinfo", filePath)
	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("error running gdalinfo: %w", err)
	}
	//fmt.Print(out.String())
	return out.String(), nil
}

// parseGdalInfoOutput parses gdalinfo's output and converts it into a map.
func ParseGdalInfoOutput(output string) map[string]string {
	metadata := make(map[string]string)
	scanner := bufio.NewScanner(strings.NewReader(output))

	var currentKey string
	var currentValue string
	for scanner.Scan() {
		line := scanner.Text()

		// Check if it's a key-value pair
		if strings.Contains(line, "=") {
			// Store the previous key-value pair
			if currentKey != "" {
				metadata[currentKey] = strings.TrimSpace(currentValue)
			}

			// Parse the new key-value pair
			parts := strings.SplitN(line, "=", 2)
			currentKey = strings.TrimSpace(parts[0])
			currentValue = strings.TrimSpace(parts[1])
		} else if currentKey != "" {
			// Append additional lines to the current value
			currentValue += " " + strings.TrimSpace(line)
		}
	}

	// Store the last key-value pair
	if currentKey != "" {
		metadata[currentKey] = strings.TrimSpace(currentValue)
	}

	return metadata
}
