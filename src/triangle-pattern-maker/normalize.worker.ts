import { normalizeImage } from "./normalize"
import type { Point } from "./types"

interface NormalizeRequest {
    imageData: ImageData
    points: [Point, Point, Point, Point]
    outputWidth: number
    outputHeight: number
}

self.onmessage = (event: MessageEvent<NormalizeRequest>) => {
    const { imageData, points, outputWidth, outputHeight } = event.data
    const normalizedImageData = normalizeImage(
        imageData,
        points,
        outputWidth,
        outputHeight
    )

    self.postMessage(normalizedImageData)
}
