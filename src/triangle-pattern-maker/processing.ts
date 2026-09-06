import type { PointsData } from "./types"
import { urlToImage, imageToImageData } from "./imageUtils"


const PX_PER_GRID = 250

export async function waitForNormalization(imageUrl: string, pointsData: PointsData): Promise<ImageData> {
    const image: HTMLImageElement = await urlToImage(imageUrl)
    const imageData: ImageData = imageToImageData(image)

    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("./normalize.worker.ts", import.meta.url),
            { type: "module" }
        )

        worker.onmessage = (event: MessageEvent<ImageData>) => {
            worker.terminate()
            resolve(event.data)
        }
        worker.onerror = (event) => {
            worker.terminate()
            reject(event.error)
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
