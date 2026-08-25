// Step Two Helper



// UI Apparance Config (percent of width)
const CIRCLE_START_OFFSET: number   = 0.1
const CIRCLE_DRAW_RADIUS: number    = 0.01
const CIRCLE_HITBOX_RADIUS: number  = 0.03
const CIRCLE_PRECISE_RADIUS: number = 0.003

const CIRCLE_ACTIVE_COLOR: string   = "#FFFFFF88"
const CIRCLE_HOVER_COLOR: string    = "#888888BB"
const CIRCLE_PASSIVE_COLOR: string  = "#00000088"
const CIRCLE_PRECISE_COLOR: string  = "#FF0000DD"

const GRID_OUTLINE_WEIGHT: number   = 0.03
const GRID_INLINE_WEIGHT: number    = 0.02
const GRID_OUTLINE_COLOR: string    = "#0088FFBB"
const GRID_INLINE_COLOR: string     = "#00FF8888"

// Elements
const xDecreaseButton = document.getElementById("decrease-x") as HTMLButtonElement
const xIncreaseButton = document.getElementById("increase-x") as HTMLButtonElement
const yDecreaseButton = document.getElementById("decrease-x") as HTMLButtonElement
const yIncreaseButton = document.getElementById("increase-x") as HTMLButtonElement

const xGridAmtOutput = document.getElementById("amt-x-grid") as HTMLOutputElement
const yGtidAmtOutput = document.getElementById("amt-y-grid") as HTMLOutputElement

const canvas = document.getElementById("align-canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const alignFinishButton = document.getElementById("align-finish-button") as HTMLButtonElement

// Interfaces
interface Point {
    x: number,
    y: number
}

interface Circle {
    location: Point,
    state: string
}

// Functions
function drawCircle(circle: Circle): void {
    ctx.beginPath()
    ctx.arc(circle.location.x, circle.location.y, CIRCLE_DRAW_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = circle.state === "active" ? CIRCLE_ACTIVE_COLOR :
        circle.state === "hover" ? CIRCLE_HOVER_COLOR :
        CIRCLE_PASSIVE_COLOR
    ctx.fill()
    ctx.closePath()
}

function drawLine(point0: Point, point1: Point, width: number, color: string): void {
    ctx.beginPath()
    ctx.moveTo(point0.x, point0.y)
    ctx.lineTo(point1.x, point1.y)
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.stroke()
}

function drawCircles(circlePositions: Circle[]): void {
    for (const circle of circlePositions) {
        drawCircle(circle)
    }
}

function drawGrid(circlePositions: Circle[], xGridAmt: number, yGridAmt: number) {
    // Inline
    let runs: number[] = []
    let rises: number[] = []

    for (let i: number = 0; i < 4; i++) {
        const circle0: Circle = circlePositions[i]!
        const circle1: Circle = circlePositions[(i+1)%4]!

        const point0: Point = {
            x: circle0.location.x,
            y: circle0.location.y
        }
        const point1: Point = {
            x: circle1.location.x,
            y: circle1.location.y
        }

        runs[i] = point1.x - point0.x
        rises[i] = point1.y - point0.y
    }

    for (let i: number = 0; i < xGridAmt; i++) {
        const circle0 = circlePositions[0]!
        const circle1 = circlePositions[2]!

        const start0: Point = {
            x: circle0.location.x,
            y: circle0.location.y
        }
        const start1: Point = {
            x: circle1.location.x,
            y: circle1.location.y
        }

        const point0: Point = {
            x: start0.x + runs[0]!  * (i+1 / xGridAmt+1),
            y: start0.y + rises[0]! * (i+1 / xGridAmt+1)
        }
        const point1: Point = {
            x: start1.x + runs[0]!  * (xGridAmt-i / xGridAmt+1),
            y: start1.y + rises[0]! * (xGridAmt-i / xGridAmt+1)
        }

        drawLine(point0, point1, GRID_INLINE_WEIGHT, GRID_INLINE_COLOR)
    }

    for (let i: number = 0; i < yGridAmt; i++) {
        const circle0 = circlePositions[1]!
        const circle1 = circlePositions[3]!

        const start0: Point = {
            x: circle0.location.x,
            y: circle0.location.y
        }
        const start1: Point = {
            x: circle1.location.x,
            y: circle1.location.y
        }

        const point0: Point = {
            x: start0.x + runs[0]!  * (i+1 / xGridAmt+1),
            y: start0.y + rises[0]! * (i+1 / xGridAmt+1)
        }
        const point1: Point = {
            x: start1.x + runs[0]!  * (xGridAmt-i / xGridAmt+1),
            y: start1.y + rises[0]! * (xGridAmt-i / xGridAmt+1)
        }

        drawLine(point0, point1, GRID_INLINE_WEIGHT, GRID_INLINE_COLOR)
    }

    // Outline
    for (let i: number = 0; i < 4; i++) {
        const circle0: Circle = circlePositions[i]!
        const circle1: Circle = circlePositions[(i+1)%4]!

        const point0: Point = {
            x: circle0.location.x,
            y: circle0.location.y
        }
        const point1: Point = {
            x: circle1.location.x,
            y: circle1.location.y
        }

        drawLine(point0, point1, GRID_OUTLINE_WEIGHT, GRID_OUTLINE_COLOR)
    }
}

// Main
export function getAlignedCorners(imageUrl: string): Promise<ImageData> {
    return new Promise((resolve) => {
        const imageW: number = 0 // TODO
        const imageH: number = 0 // TODO

        let circlePositions: Circle[] = [
            {
                location: {
                    x: imageW * CIRCLE_START_OFFSET,
                    y: imageH * CIRCLE_START_OFFSET
                },
                state: "passive"
            }, {
                location: {
                    x: imageW * (1 - CIRCLE_START_OFFSET),
                    y: imageH * CIRCLE_START_OFFSET
                },
                state: "passive"
            }, {
                location: {
                    x: imageW * (1 - CIRCLE_START_OFFSET),
                    y: imageH * (1 - CIRCLE_START_OFFSET)
                },
                state: "passive"
            }, {
                location: {
                    x: imageW * CIRCLE_START_OFFSET,
                    y: imageH * (1 - CIRCLE_START_OFFSET)
                },
                state: "passive"
            }
        ]
    }
}
