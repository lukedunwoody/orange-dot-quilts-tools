export function urlToImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => resolve(image)
        image.onerror = reject

        image.src = imageUrl
    })
}

export function imageToImageData(image: HTMLImageElement): ImageData {
    const tmpCanvas = document.createElement("canvas")
    const tmpCtx = tmpCanvas.getContext("2d")!

    tmpCanvas.width = image.naturalWidth
    tmpCanvas.height = image.naturalHeight

    tmpCtx.drawImage(image, 0, 0)

    return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height)
}
