export interface Point {
    x: number
    y: number
}

export interface ImageDataPayload {
    width: number
    height: number
    data: Uint8ClampedArray
}

export interface PointsData {
    gridWidth: number
    gridHeight: number
    points: [Point, Point, Point, Point]
}

export interface NormalizeRequest {
    pointsData: PointsData
    imageData: ImageDataPayload
}
