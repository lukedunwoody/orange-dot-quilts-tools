import type { ImageDataPayload, NormalizeRequest } from "./types.js"

export function encodeNormalize(request: NormalizeRequest): ArrayBuffer {
    const { pointsData, imageData } = request
    const { gridWidth, gridHeight, points } = pointsData

    const pointBytes = points.length * 16
    const pixelBytes = imageData.data.byteLength

    const buffer = new ArrayBuffer(
        16 + pointBytes + pixelBytes
    )

    const view = new DataView(buffer)
    let offset = 0

    view.setUint32(offset, gridWidth)
    offset += 4

    view.setUint32(offset, gridHeight)
    offset += 4

    for (const point of points) {
        view.setFloat64(offset, point.x)
        offset += 8

        view.setFloat64(offset, point.y)
        offset += 8
    }

    view.setUint32(offset, imageData.width)
    offset += 4

    view.setUint32(offset, imageData.height)
    offset += 4

    new Uint8Array(buffer, offset).set(imageData.data)

    return buffer
}

export function decodeNormalize(buffer: ArrayBuffer): NormalizeRequest {
    const view = new DataView(buffer)
    let offset = 0

    const gridWidth = view.getUint32(offset)
    offset += 4

    const gridHeight = view.getUint32(offset)
    offset += 4

    const points: [
        { x: number, y: number },
        { x: number, y: number },
        { x: number, y: number },
        { x: number, y: number }
    ] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
    ]

    for (let i = 0; i < 4; i++) {
        points[i] = {
            x: view.getFloat64(offset),
            y: view.getFloat64(offset + 8)
        }

        offset += 16
    }

    const width = view.getUint32(offset)
    offset += 4

    const height = view.getUint32(offset)
    offset += 4

    const data = new Uint8ClampedArray(buffer, offset)

    return {
        pointsData: {
            gridWidth,
            gridHeight,
            points
        },
        imageData: {
            width,
            height,
            data
        }
    }
}

export function encodeImageData(imageData: ImageDataPayload): ArrayBuffer  {
    const pixelData = new Uint8Array(imageData.data.buffer)

    const buffer = new ArrayBuffer(8 + pixelData.byteLength)
    const view = new DataView(buffer)

    view.setUint32(0, imageData.width)
    view.setUint32(4, imageData.height)

    new Uint8Array(buffer, 8).set(pixelData)

    return buffer
}

export function decodeImageData(buffer: ArrayBuffer): ImageDataPayload {
    const view = new DataView(buffer)

    const width = view.getUint32(0)
    const height = view.getUint32(4)

    const data = new Uint8ClampedArray(buffer, 8)

    return {
        width,
        height,
        data
    }
}
