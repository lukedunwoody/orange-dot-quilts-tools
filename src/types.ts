export interface Point {
    x: number
    y: number
}

export interface PointsData {
    gridWidth: number
    gridHeight: number
    points: [Point, Point, Point, Point]
}

export interface RGBA {
    r: number,
    g: number,
    b: number,
    a: number
}
