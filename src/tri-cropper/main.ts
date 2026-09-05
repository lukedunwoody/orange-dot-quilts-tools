import type { PointsData } from "./types"
import { urlToImage, imageToImageData } from "./imageUtils"
import { showStep } from "./steps"

import { getImageUpload } from "./upload"
import { getAlignedCorners } from "./align"
import { normalizeImage } from "./normalize"
import { letUserPreview } from "./preview"

const PX_PER_GRID = 250

async function main() {
    // Step 1
    showStep("upload")
    const imageUrl: string = await getImageUpload()

    // Step 2
    showStep("align")
    const pointsData: PointsData = await getAlignedCorners(imageUrl)

    // Step 3
    const image: HTMLImageElement = await urlToImage(imageUrl)
    const imageData: ImageData = imageToImageData(image)

    const normalizedImageData: ImageData = normalizeImage(
        imageData,
        pointsData.points,
        pointsData.gridWidth * PX_PER_GRID,
        pointsData.gridHeight * PX_PER_GRID
    )

    showStep("preview")
    await letUserPreview(normalizedImageData, pointsData.gridWidth, pointsData.gridHeight)
}

while (true) await main()
