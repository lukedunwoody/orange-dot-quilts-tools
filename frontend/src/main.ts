import { getImageUpload } from "./upload.js"
import { getAlignedCorners } from "./align.js"

import type { Point } from "./types"

async function main() {
    console.log("Starting Step 1")

    const imageUrl: string = await getImageUpload()

    console.log("Starting Step 2")

    const points: Point[] = await getAlignedCorners(imageUrl)
}

main()
