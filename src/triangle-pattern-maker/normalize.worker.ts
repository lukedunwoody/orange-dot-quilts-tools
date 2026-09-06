import { normalizeImage } from "./normalize"
import type { Point } from "./types"

interface NormalizeRequest {
    imageData: ImageData
    points: [Point, Point, Point, Point]
    outputWidth: number
    outputHeight: number
}

export type NormalizeWorkerMessage =
    | { type: "progress", percent: number }
    | { type: "complete", imageData: ImageData }

self.onmessage = (event: MessageEvent<NormalizeRequest>) => {
    const { imageData, points, outputWidth, outputHeight } = event.data
    const normalizedImageData = normalizeImage(
        imageData,
        points,
        outputWidth,
        outputHeight,
        (percent) => self.postMessage({ type: "progress", percent })
    )

    self.postMessage({ type: "complete", imageData: normalizedImageData })
}
