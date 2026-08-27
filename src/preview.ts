// Step Three Helper

const previewImage = document.getElementById("preview-image") as HTMLImageElement
const previewDownloadButton = document.getElementById("preview-download-button") as HTMLButtonElement

const canvas = document.getElementById("preview-canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

export function letUserPreview(normalizedImageData: ImageData): Promise<void> {
    return new Promise((resolve) => {
        canvas.width = normalizedImageData.width
        canvas.height = normalizedImageData.height

        ctx.putImageData(normalizedImageData, 0, 0)

        resolve()
    })
}
