import type { PointsData, NormalizeRequest } from "@odq-tri-cropper/shared"
import { encodeNormalize, decodeNormalize, encodeImageData, decodeImageData } from "@odq-tri-cropper/shared"

import { urlToImage, imageToImageData } from "./imageUtils.js"

import { getImageUpload } from "./upload.js"
import { getAlignedCorners } from "./align.js"
import { letUserPreview } from "./preview.js"

async function main() {
    // Step 1
    const imageUrl: string = await getImageUpload()

    // Step 2
    const pointsData: PointsData = await getAlignedCorners(imageUrl)

    // Step 3
    const image: HTMLImageElement = await urlToImage(imageUrl)
    const imageData: ImageData = imageToImageData(image)

    const requestData: NormalizeRequest = { pointsData, imageData }
    const binary: ArrayBuffer = encodeNormalize(requestData)

    const response = await fetch("http://localhost:3000/api/normalize", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream"
        },
        body: binary
    })

    const result: ArrayBuffer = await response.arrayBuffer()
    const normalizedImageDataPayload = decodeImageData(result)

    const normalizedImageData = new ImageData(
        new Uint8ClampedArray(normalizedImageDataPayload.data),
        normalizedImageDataPayload.width,
        normalizedImageDataPayload.height,
        { colorSpace: "srgb" }
    )

    letUserPreview(normalizedImageData)
}

main()
