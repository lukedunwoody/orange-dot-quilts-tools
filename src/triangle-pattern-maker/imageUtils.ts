import type { RGBA } from "./types"

export function urlToImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => resolve(image)
        image.onerror = reject

        image.src = imageUrl
    })
}

const MAX_IMAGE_DIMENSION = 2400

export function resizeImageUrl(image: HTMLImageElement): string {
    const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / image.naturalWidth,
        MAX_IMAGE_DIMENSION / image.naturalHeight
    )
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Unable to prepare the uploaded image")

    context.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL("image/png")
}

export function imageToImageData(image: HTMLImageElement): ImageData {
    const tmpCanvas = document.createElement("canvas")
    const tmpCtx = tmpCanvas.getContext("2d")!

    tmpCanvas.width = image.naturalWidth
    tmpCanvas.height = image.naturalHeight

    tmpCtx.drawImage(image, 0, 0)

    return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height)
}

export function getPixelColor(imageData: ImageData, x: number, y: number): RGBA {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
        console.log("--- ERROR: OUT OF BOUNDS ---\nDEBUG:\nfunc: getPixelColor")
        console.log(`ImgData: ${imageData.width}, ${imageData.height}`)
        console.log(`Asked for: ${x}, ${y}`)
        throw new Error("Coordinates are out of bounds")
    }
    const index = (y * imageData.width + x) * 4
    return {
        r: imageData.data[index]!,     // Red (0-255)
        g: imageData.data[index + 1]!, // Green (0-255)
        b: imageData.data[index + 2]!, // Blue (0-255)
        a: imageData.data[index + 3]!  // Alpha/Opacity (0-255)
    }
}

export function setPixelColor(imageData: ImageData, x: number, y: number, color: RGBA): void {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
        console.log("--- ERROR: OUT OF BOUNDS ---\nDEBUG:\nfunc: setPixelColor")
        console.log(`ImgData: ${imageData.width}, ${imageData.height}`)
        console.log(`Asked for: ${x}, ${y}`)
        throw new Error("Coordinates are out of bounds")
    }
    const index = (y * imageData.width + x) * 4
    imageData.data[index] = Math.round(color.r)
    imageData.data[index + 1] = Math.round(color.g)
    imageData.data[index + 2] = Math.round(color.b)
    imageData.data[index + 3] = Math.round(color.a)
}
