from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import rasterio
from rasterio.windows import from_bounds
import io

app = FastAPI()


# Define a Pydantic model for the bounding box input
class BoundingBox(BaseModel):
    bbox: list[float]  # A list of [min_lon, min_lat, max_lon, max_lat]


@app.post("/api/download-raster")
async def download_raster(data: BoundingBox):
    bbox = data.bbox
    min_lon, min_lat, max_lon, max_lat = bbox

    # Open the raster dataset
    try:
        with rasterio.open("http://127.0.0.1:8443/cog/stacked.tif") as dataset:
            # Get the window from the bounding box
            window = from_bounds(min_lon, min_lat, max_lon, max_lat, dataset.transform)

            # Read the data in the specified window
            data = dataset.read(1, window=window)

            # Create an in-memory file to hold the new raster data (TIFF format)
            memfile = io.BytesIO()
            with rasterio.open(
                memfile,
                "w",
                driver="GTiff",
                width=window.width,
                height=window.height,
                count=1,
                dtype=data.dtype,
                crs=dataset.crs,
                transform=dataset.transform,
            ) as out_dataset:
                out_dataset.write(data, 1)

            memfile.seek(0)  # Rewind the in-memory file before sending it

            # Return the raster data as a streaming response
            return StreamingResponse(
                memfile,
                media_type="image/tiff",
                headers={
                    "Content-Disposition": "attachment; filename=partial_raster.tif"
                },
            )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing the raster file: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8553)
