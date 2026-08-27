// Step Two Helper

import { urlToImage } from "./imageUtils.js"
import type { Point, PointsData } from "./types.js"

// UI Apparance Config (percent of width)
const CIRCLE_START_OFFSET: number     = 0.125
const CIRCLE_DRAW_RADIUS: number      = 0.008
const CIRCLE_HITBOX_RADIUS: number    = CIRCLE_DRAW_RADIUS * 3
const CIRCLE_PRECISE_RADIUS: number   = CIRCLE_DRAW_RADIUS / 5

const CIRCLE_ACTIVE_COLORS: string[]  = ["#FFFFFF88", "#00000088"]
const CIRCLE_HOVER_COLORS: string[]   = ["#888888BB", "#888888BB"]
const CIRCLE_PASSIVE_COLORS: string[] = ["#00000088", "#FFFFFF88"]
const CIRCLE_PRECISE_COLORS: string[] = ["#FF0000FF", "#00FFFFFF"]

const GRID_OUTLINE_WEIGHT: number     = CIRCLE_PRECISE_RADIUS * 2
const GRID_INLINE_WEIGHT: number      = GRID_OUTLINE_WEIGHT / 2
const GRID_OUTLINE_COLORS: string[]   = ["#000000FF", "#FFFFFFFF"]
const GRID_INLINE_COLORS: string[]    = ["#000000FF", "#FFFFFFFF"]

// Elements
const xDecreaseButton = document.getElementById("decrease-x") as HTMLButtonElement
const xIncreaseButton = document.getElementById("increase-x") as HTMLButtonElement
const yDecreaseButton = document.getElementById("decrease-y") as HTMLButtonElement
const yIncreaseButton = document.getElementById("increase-y") as HTMLButtonElement

const xGridAmtOutput = document.getElementById("amt-x-grid") as HTMLOutputElement
const yGridAmtOutput = document.getElementById("amt-y-grid") as HTMLOutputElement

const swapColorButton = document.getElementById("swap-color") as HTMLButtonElement

const canvas = document.getElementById("align-canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const alignFinishButton = document.getElementById("align-finish-button") as HTMLButtonElement

// Interfaces
interface Circle {
    location: Point,
    state: string
}

// Listener Functions
let xGridAmt = 3
let yGridAmt = 3

xGridAmtOutput.value = xGridAmt.toString()
yGridAmtOutput.value = yGridAmt.toString()

function xDecreasePress(): void {
    xGridAmt = clamp(xGridAmt - 1, 2, 5)
    xGridAmtOutput.value = xGridAmt.toString()
}

function xIncreasePress(): void {
    xGridAmt = clamp(xGridAmt + 1, 2, 5)
    xGridAmtOutput.value = xGridAmt.toString()
}

function yDecreasePress(): void {
    yGridAmt = clamp(yGridAmt - 1, 2, 5)
    yGridAmtOutput.value = yGridAmt.toString()
}

function yIncreasePress(): void {
    yGridAmt = clamp(yGridAmt + 1, 2, 5)
    yGridAmtOutput.value = yGridAmt.toString()
}

let activeColorIndex: number = 0

let circleActiveColor: string = CIRCLE_ACTIVE_COLORS[activeColorIndex]!
let circleHoverColor: string = CIRCLE_HOVER_COLORS[activeColorIndex]!
let circlePassiveColor: string = CIRCLE_PASSIVE_COLORS[activeColorIndex]!
let circlePreciseColor: string = CIRCLE_PRECISE_COLORS[activeColorIndex]!

let gridOutlineColor: string = GRID_OUTLINE_COLORS[activeColorIndex]!
let gridInlineColor: string = GRID_INLINE_COLORS[activeColorIndex]!

function swapColorPress(): void {
    activeColorIndex = (activeColorIndex + 1) % 2

    circleActiveColor = CIRCLE_ACTIVE_COLORS[activeColorIndex]!
    circleHoverColor = CIRCLE_HOVER_COLORS[activeColorIndex]!
    circlePassiveColor = CIRCLE_PASSIVE_COLORS[activeColorIndex]!
    circlePreciseColor = CIRCLE_PRECISE_COLORS[activeColorIndex]!

    gridOutlineColor = GRID_OUTLINE_COLORS[activeColorIndex]!
    gridInlineColor = GRID_INLINE_COLORS[activeColorIndex]!
}

let mouseX: number = 0
let mouseY: number = 0
let mouseLastX: number = 0
let mouseLastY: number = 0
let mouseDiffX: number = 0
let mouseDiffY: number = 0
let mouseDown: boolean = false

function onPointerMove(e: PointerEvent) {
    mouseX = e.offsetX
    mouseY = e.offsetY
}

function onPointerDown() {
    mouseDown = true
}

function onPointerUp() {
    mouseDown = false
}

// Util Functions
function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max)
}

function drawCircle(circle: Circle, radius: number, preciseRadius: number): void {
    ctx.beginPath()
    ctx.arc(circle.location.x, circle.location.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = circle.state === "active" ? circleActiveColor :
        circle.state === "hover" ? circleHoverColor :
        circlePassiveColor
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(circle.location.x, circle.location.y, preciseRadius, 0, Math.PI * 2)
    ctx.fillStyle = circlePreciseColor
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

function drawCircles(circlePositions: Circle[], imageW: number): void {
    for (const circle of circlePositions) {
        drawCircle(circle, CIRCLE_DRAW_RADIUS * imageW, CIRCLE_PRECISE_RADIUS * imageW)
    }
}

function drawGrid(circlePositions: Circle[], xGridAmt: number, yGridAmt: number, imageW: number): void {
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

    for (let i: number = 0; i < xGridAmt - 1; i++) {
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
            x: start0.x + runs[0]!  * ((i+1) / xGridAmt),
            y: start0.y + rises[0]! * ((i+1) / xGridAmt)
        }
        const point1: Point = {
            x: start1.x + runs[2]!  * ((xGridAmt-(i+1)) / xGridAmt),
            y: start1.y + rises[2]! * ((xGridAmt-(i+1)) / xGridAmt)
        }

        drawLine(point0, point1, GRID_INLINE_WEIGHT * imageW, gridInlineColor)
    }

    for (let i: number = 0; i < yGridAmt - 1; i++) {
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
            x: start0.x + runs[1]!  * ((i+1) / yGridAmt),
            y: start0.y + rises[1]! * ((i+1) / yGridAmt)
        }
        const point1: Point = {
            x: start1.x + runs[3]!  * ((yGridAmt-(i+1)) / yGridAmt),
            y: start1.y + rises[3]! * ((yGridAmt-(i+1)) / yGridAmt)
        }

        drawLine(point0, point1, GRID_INLINE_WEIGHT * imageW, gridInlineColor)
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

        drawLine(point0, point1, GRID_OUTLINE_WEIGHT * imageW, gridOutlineColor)
    }
}

// Main
export function getAlignedCorners(imageUrl: string): Promise<PointsData> {
    return new Promise(async (resolve) => {
        // Data
        const image = await urlToImage(imageUrl)

        const imageW: number = image.naturalWidth
        const imageH: number = image.naturalHeight

        canvas.width = imageW
        canvas.height = imageH

        let circlePositions: [Circle, Circle, Circle, Circle] = [
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

        // Listeners
        xDecreaseButton.addEventListener("click", xDecreasePress)
        xIncreaseButton.addEventListener("click", xIncreasePress)
        yDecreaseButton.addEventListener("click", yDecreasePress)
        yIncreaseButton.addEventListener("click", yIncreasePress)

        swapColorButton.addEventListener("click", swapColorPress)

        canvas.addEventListener("pointermove", onPointerMove)
        canvas.addEventListener("pointerdown", onPointerDown)
        canvas.addEventListener("pointerup", onPointerUp)

        // Functions
        function updateMouseDiff(): void {
            mouseDiffX = mouseLastX - mouseX
            mouseDiffY = mouseLastY - mouseY

            mouseLastX = mouseX
            mouseLastY = mouseY
        }

        function updateCircles(): void {
            const hitboxRadius = CIRCLE_HITBOX_RADIUS * imageW

            for (const circle of circlePositions) {
                const isUnderPointer = (
                    Math.abs(mouseX - circle.location.x) < CIRCLE_HITBOX_RADIUS * imageW
                    && Math.abs(mouseY - circle.location.y) < CIRCLE_HITBOX_RADIUS * imageW
                )

                if (circle.state === "active" && mouseDown) {
                    continue
                }

                if (isUnderPointer && !mouseDown) {
                    circle.state = "hover"
                } else if (isUnderPointer && mouseDown && circle.state === "hover") {
                    circle.state = "active"
                } else {
                    circle.state = "passive"
                }
            }
        }

        const update = (): void => {
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
            ctx.drawImage(image, 0, 0)
            updateMouseDiff()
            updateCircles()

            for (const circle of circlePositions) {
                if (circle.state === "active") {
                    circle.location.x -= mouseDiffX
                    circle.location.y -= mouseDiffY
                }
            }

            drawGrid(circlePositions, xGridAmt, yGridAmt, imageW)
            drawCircles(circlePositions, imageW)

            requestAnimationFrame(update)
        }

        // Finish Button
        alignFinishButton.onclick = () => {
            xDecreaseButton.removeEventListener("click", xDecreasePress)
            xIncreaseButton.removeEventListener("click", xIncreasePress)
            yDecreaseButton.removeEventListener("click", yDecreasePress)
            yIncreaseButton.removeEventListener("click", yIncreasePress)

            swapColorButton.removeEventListener("click", swapColorPress)

            canvas.removeEventListener("pointermove", onPointerMove)
            canvas.removeEventListener("pointerdown", onPointerDown)
            canvas.removeEventListener("pointerup", onPointerUp)

            const returnPoints: [Point, Point, Point, Point] = circlePositions.map(circle => ({
                x: circle.location.x / imageW,
                y: circle.location.y / imageH
            })) as [Point, Point, Point, Point]

            resolve({
                gridWidth: xGridAmt,
                gridHeight: yGridAmt,
                points: returnPoints,
            })
        }

        // Entry Point
        update()
    })
}
