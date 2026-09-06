import type { PointsData } from "./types"
import { showStep } from "./steps"

import { getImageUpload } from "./upload"
import { getAlignedCorners } from "./align"
import { letUserPreview } from "./preview"
import { waitForNormalization } from "./progress"

async function main() {
    // Step 1
    showStep("upload")
    const imageUrl: string = await getImageUpload()

    // Step 2
    showStep("align")
    const pointsData: PointsData = await getAlignedCorners(imageUrl)

    // Step 3
    showStep("progress")
    const normalizedImageData: ImageData = await waitForNormalization(imageUrl, pointsData)

    // Step 4
    showStep("preview")
    await letUserPreview(normalizedImageData, pointsData.gridWidth, pointsData.gridHeight)
}

while (true) await main()
