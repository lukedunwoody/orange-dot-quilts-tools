import type { PointsData } from "./types"
import { urlToImage, imageToImageData } from "./imageUtils"

import { getImageUpload } from "./upload"
import { getAlignedCorners } from "./align"
import { normalizeImage } from "./normalize"
import { letUserPreview } from "./preview"

const PX_PER_GRID = 250

async function main() {
    // Step 1
    const imageUrl: string = await getImageUpload()

    // Step 2
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

    letUserPreview(normalizedImageData, pointsData.gridWidth, pointsData.gridHeight)
}

main()
