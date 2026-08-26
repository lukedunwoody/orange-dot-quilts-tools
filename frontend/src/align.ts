// Step Two Helper

// TODO remove event listeners after function returns

import { urlToImage } from "./imageUtils.js"
import type { Point } from "./types.js"

// UI Apparance Config (percent of width)
const CIRCLE_START_OFFSET: number   = 0.1
const CIRCLE_DRAW_RADIUS: number    = 0.01
const CIRCLE_HITBOX_RADIUS: number  = 0.03
const CIRCLE_PRECISE_RADIUS: number = 0.003

const CIRCLE_ACTIVE_COLOR: string   = "#FFFFFF88"
const CIRCLE_HOVER_COLOR: string    = "#888888BB"
const CIRCLE_PASSIVE_COLOR: string  = "#00000088"
const CIRCLE_PRECISE_COLOR: string  = "#FF0000DD"

const GRID_OUTLINE_WEIGHT: number   = 0.01
const GRID_INLINE_WEIGHT: number    = 0.005
const GRID_OUTLINE_COLOR: string    = "#0088FFBB"
const GRID_INLINE_COLOR: string     = "#00FF8888"

// Elements
const xDecreaseButton = document.getElementById("decrease-x") as HTMLButtonElement
const xIncreaseButton = document.getElementById("increase-x") as HTMLButtonElement
const yDecreaseButton = document.getElementById("decrease-y") as HTMLButtonElement
const yIncreaseButton = document.getElementById("increase-y") as HTMLButtonElement

const xGridAmtOutput = document.getElementById("amt-x-grid") as HTMLOutputElement
const yGridAmtOutput = document.getElementById("amt-y-grid") as HTMLOutputElement

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
    ctx.fillStyle = circle.state === "active" ? CIRCLE_ACTIVE_COLOR :
        circle.state === "hover" ? CIRCLE_HOVER_COLOR :
        CIRCLE_PASSIVE_COLOR
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(circle.location.x, circle.location.y, preciseRadius, 0, Math.PI * 2)
    ctx.fillStyle = CIRCLE_PRECISE_COLOR
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

        drawLine(point0, point1, GRID_INLINE_WEIGHT * imageW, GRID_INLINE_COLOR)
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

        drawLine(point0, point1, GRID_INLINE_WEIGHT * imageW, GRID_INLINE_COLOR)
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

        drawLine(point0, point1, GRID_OUTLINE_WEIGHT * imageW, GRID_OUTLINE_COLOR)
    }
}

// Main
export function getAlignedCorners(imageUrl: string): Promise<Point[]> {
    return new Promise(async (resolve) => {
        // Data
        const image = await urlToImage(imageUrl)

        const imageW: number = image.naturalWidth
        const imageH: number = image.naturalHeight

        canvas.width = imageW
        canvas.height = imageH

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

        // Listeners
        xDecreaseButton.addEventListener("click", xDecreasePress)
        xIncreaseButton.addEventListener("click", xIncreasePress)
        yDecreaseButton.addEventListener("click", yDecreasePress)
        yIncreaseButton.addEventListener("click", yIncreasePress)

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

            canvas.removeEventListener("pointermove", onPointerMove)
            canvas.removeEventListener("pointerdown", onPointerDown)
            canvas.removeEventListener("pointerup", onPointerUp)

            resolve(
                circlePositions.map(circle => ({
                    x: circle.location.x / imageW,
                    y: circle.location.y / imageH
                }))
            )
        }

        // Entry Point
        update()
    })
}
