import type { PointsData } from "./types"
import { urlToImage, imageToImageData } from "./imageUtils"

interface NormalizeWorkerMessage {
    type: "progress" | "complete"
    percent?: number
    imageData?: ImageData
}


const PX_PER_GRID = 250

export async function waitForNormalization(imageUrl: string, pointsData: PointsData): Promise<ImageData> {
    const image: HTMLImageElement = await urlToImage(imageUrl)
    const imageData: ImageData = imageToImageData(image)

    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("./normalize.worker.ts", import.meta.url),
            { type: "module" }
        )

        worker.onmessage = (event: MessageEvent<NormalizeWorkerMessage>) => {
            if (event.data.type === "progress") {
                const progressText = document.getElementById("progress-text")
                if (progressText) {
                    progressText.textContent = `This may take some time (${Math.round(event.data.percent ?? 0)}%)`
                }
                return
            }

            worker.terminate()
            if (event.data.imageData) resolve(event.data.imageData)
            else reject(new Error("Normalization worker returned no image data"))
        }
        worker.onerror = (event) => {
            worker.terminate()
            reject(event.error ?? new Error(
                `Normalization worker failed${event.message ? `: ${event.message}` : ""}`
            ))
        }

        worker.postMessage(
            {
                imageData,
                points: pointsData.points,
                outputWidth: pointsData.gridWidth * PX_PER_GRID,
                outputHeight: pointsData.gridHeight * PX_PER_GRID
            },
            [imageData.data.buffer]
        )
    })
}
