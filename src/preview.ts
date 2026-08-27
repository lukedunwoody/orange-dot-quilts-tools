// Step Three Helper

import type { Point } from "./types"

// UI Appearance Config (percent of width)
const LINE_WEIGHT: number    = 0.01
const GRID_COLORS: string[]  = ["#000000FF", "#FFFFFFFF"]
const HOVER_COLORS: string[] = ["#00000088", "#FFFFFF88"]

// Elements
const previewSwapColorButton = document.getElementById("preview-swap-color") as HTMLButtonElement
const previewImage = document.getElementById("preview-image") as HTMLImageElement
const previewDownloadButton = document.getElementById("preview-download-button") as HTMLButtonElement
const restartButton = document.getElementById("restart-button") as HTMLButtonElement

const canvas = document.getElementById("preview-canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

// Listener Functions
let activeColorIndex: number = 0
let gridColor: string = GRID_COLORS[activeColorIndex]!
let hoverColor: string = HOVER_COLORS[activeColorIndex]!

function swapColorPress(): void {
    activeColorIndex = (activeColorIndex + 1) % 2
    gridColor = GRID_COLORS[activeColorIndex]!
    hoverColor = HOVER_COLORS[activeColorIndex]!
}

let mouseX: number = 0
let mouseY: number = 0
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
function drawLine(point0: Point, point1: Point, width: number, color: string): void {
    ctx.beginPath()
    ctx.moveTo(point0.x, point0.y)
    ctx.lineTo(point1.x, point1.y)
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.stroke()
}

function drawTriGrid(
    canvasW: number, canvasH: number,
    imageW: number, imageH: number,
    xGridAmt: number, yGridAmt: number)
{
    const lineWeight: number = (LINE_WEIGHT * imageW)

    // Border
    const lineOffsetBorder: number = lineWeight / 2
    const borderPoints: Point[] = [
        {
            x: lineOffsetBorder,
            y: lineOffsetBorder
        }, {
            x: canvasW - lineOffsetBorder,
            y: lineOffsetBorder
        }, {
            x: canvasW - lineOffsetBorder,
            y: canvasH - lineOffsetBorder
        }, {
            x: lineOffsetBorder,
            y: canvasH - lineOffsetBorder
        }
    ]

    for (let i: number = 0; i < 4; i++) {
        let point0: Point = { ...borderPoints[i]! }
        let point1: Point = { ...borderPoints[(i + 1) % 4]! }

        if (i % 2 === 0) {
            point0.x += i === 0 ? -lineOffsetBorder : lineOffsetBorder
            point1.x += i === 0 ? lineOffsetBorder : -lineOffsetBorder
        }

        drawLine(point0, point1, lineWeight, gridColor)
    }

    // Lines
    for (let i: number = 1; i < xGridAmt; i++) {
        const xPos: number = ((i / xGridAmt) * imageW) + lineWeight
        const point0: Point = {
            x: xPos,
            y: 0
        }
        const point1: Point = {
            x: xPos,
            y: canvasH
        }
        drawLine(point0, point1, lineWeight, gridColor)
    }

    for (let i: number = 1; i < yGridAmt; i++) {
        const yPos: number = ((i / yGridAmt) * imageW) + lineWeight
        const point0: Point = {
            x: 0,
            y: yPos
        }
        const point1: Point = {
            x: canvasW,
            y: yPos
        }
        drawLine(point0, point1, lineWeight, gridColor)
    }

    // Diagonals
    const diagPoints0: Point[] = []
    const diagPoints1: Point[] = []

    function findDiagEnd(diagPoints0: Point, increaseX: boolean): Point {
        const steps = Math.min(
            increaseX ? xGridAmt - diagPoints0.x : diagPoints0.x,
            yGridAmt - diagPoints0.y
        )

        return {
            x: diagPoints0.x + (increaseX ? steps : -steps),
            y: diagPoints0.y + steps,
        }
    }

    for (let i: number = 0; i < xGridAmt; i++) {
        const diagPoint0: Point = {
            x: i,
            y: 0,
        }
        const diagPoint1: Point = findDiagEnd(diagPoint0, true)

        diagPoints0.push(diagPoint0)
        diagPoints1.push(diagPoint1)
    }

    for (let i: number = 1; i < yGridAmt; i++) {
        const diagPoint0: Point = {
            x: 0,
            y: i,
        }
        const diagPoint1: Point = findDiagEnd(diagPoint0, true)

        diagPoints0.push(diagPoint0)
        diagPoints1.push(diagPoint1)
    }

    for (let i: number = xGridAmt; i > 0; i--) {
        const diagPoint0: Point = {
            x: i,
            y: 0,
        }
        const diagPoint1: Point = findDiagEnd(diagPoint0, false)

        diagPoints0.push(diagPoint0)
        diagPoints1.push(diagPoint1)
    }

    for (let i: number = yGridAmt - 1; i > 0; i--) {
        const diagPoint0: Point = {
            x: xGridAmt,
            y: i,
        }
        const diagPoint1: Point = findDiagEnd(diagPoint0, false)

        diagPoints0.push(diagPoint0)
        diagPoints1.push(diagPoint1)
    }

    for (let i: number = 0; i < diagPoints0.length; i++) {
        const diagPoint0: Point = diagPoints0[i]!
        const diagPoint1: Point = diagPoints1[i]!

        const point0: Point = {
            x: lineWeight + ((diagPoint0.x / xGridAmt) * imageW),
            y: lineWeight + ((diagPoint0.y / yGridAmt) * imageH)
        }
        const point1: Point = {
            x: lineWeight + ((diagPoint1.x / xGridAmt) * imageW),
            y: lineWeight + ((diagPoint1.y / yGridAmt) * imageH)
        }

        drawLine(point0, point1, lineWeight, gridColor)
    }
}

export function letUserPreview(normalizedImageData: ImageData, xGridAmt: number, yGridAmt: number): Promise<void> {
    return new Promise((resolve) => {
        canvas.width = normalizedImageData.width + (normalizedImageData.width * LINE_WEIGHT * 2)
        canvas.height = normalizedImageData.height + (normalizedImageData.width * LINE_WEIGHT * 2)

        canvas.addEventListener("pointermove", onPointerMove)
        canvas.addEventListener("pointerdown", onPointerDown)
        canvas.addEventListener("pointerup", onPointerUp)

        previewSwapColorButton.addEventListener("click", swapColorPress)

        function update(): void {
            ctx.putImageData(normalizedImageData, normalizedImageData.width * LINE_WEIGHT, normalizedImageData.width * LINE_WEIGHT)
            drawTriGrid(
                canvas.width, canvas.height,
                normalizedImageData.width, normalizedImageData.height,
                xGridAmt, yGridAmt
            )

            requestAnimationFrame(update)
        }

        function restartPress(): void {
            restartButton.removeEventListener("click", restartPress)

            canvas.removeEventListener("pointermove", onPointerMove)
            canvas.removeEventListener("pointerdown", onPointerDown)
            canvas.removeEventListener("pointerup", onPointerUp)

            previewSwapColorButton.removeEventListener("click", swapColorPress)

            resolve()
        }

        restartButton.addEventListener("click", restartPress)

        update()
    })
}
