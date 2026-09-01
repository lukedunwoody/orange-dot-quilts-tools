// Step Three Helper

import { getPixelColor, setPixelColor } from "./imageUtils"
import type { Point, RGBA } from "./types"

// UI Appearance Config (percent of width)
const LINE_WEIGHT: number     = 0.004
const GRID_COLORS: string[]   = ["#000000FF", "#FFFFFFFF"]
const HOVER_COLORS: string[]  = ["#00000088", "#FFFFFF88"]
const ACTIVE_COLORS: string[] = ["#44444488", "#AAAAAA88"]

// Elements
const previewSwapColorButton = document.getElementById("preview-swap-color") as HTMLButtonElement
const previewDownloadButton = document.getElementById("preview-download-button") as HTMLButtonElement
const restartButton = document.getElementById("restart-button") as HTMLButtonElement

const canvas = document.getElementById("preview-select-canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
const completeCanvas = document.getElementById("preview-complete-canvas") as HTMLCanvasElement
const completeTX = completeCanvas.getContext("2d") as CanvasRenderingContext2D

// Interfaces
interface TriData {
    points: [Point, Point, Point]
    pos: [number, number, number]
    corners: [Point, Point, Point, Point]
}

// Listener Functions
let activeColorIndex: number = 0
let gridColor: string = GRID_COLORS[activeColorIndex]!
let hoverColor: string = HOVER_COLORS[activeColorIndex]!
let activeColor: string = ACTIVE_COLORS[activeColorIndex]!

function swapColorPress(): void {
    activeColorIndex = (activeColorIndex + 1) % 2
    gridColor = GRID_COLORS[activeColorIndex]!
    hoverColor = HOVER_COLORS[activeColorIndex]!
    activeColor = ACTIVE_COLORS[activeColorIndex]!
}

let mouseX: number = 0
let mouseY: number = 0
let mouseDown: boolean = false
let mouseDownLast: boolean = false

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
    xGridAmt: number, yGridAmt: number): void
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

function getTriData(pxPerGrid: number): TriData {
    // Determine row and column
    const gridCords: Point = {
        x: Math.floor(mouseX / pxPerGrid),
        y: Math.floor(mouseY / pxPerGrid)
    }

    // Determine corner cords of grid square
    let cornerCords: [Point, Point, Point, Point] = [
        {x: 0, y: 0},
        {x: 0, y: 0},
        {x: 0, y: 0},
        {x: 0, y: 0}
    ]
    let midPoint: Point = {x: 0, y: 0}

    for (let i: number = 0; i < 4; i++) {
        let x: number = (i === 0 || i === 3 ? gridCords.x * pxPerGrid : (gridCords.x + 1) * pxPerGrid)
        let y: number = (i === 0 || i === 1 ? gridCords.y * pxPerGrid : (gridCords.y + 1) * pxPerGrid)

        cornerCords[i] = {
            x: x,
            y: y
        }

        midPoint.x += x
        midPoint.y += y
    }

    midPoint.x /= 4
    midPoint.y /= 4

    // Determine mouse cords as percentage inside grid
    const relativeCords: Point = {
        x: (mouseX - cornerCords[0]!.x) / pxPerGrid,
        y: (mouseY - cornerCords[0]!.y) / pxPerGrid
    }

    const nOfNW = relativeCords.x > relativeCords.y
    const nOfNE = relativeCords.x < (1 - relativeCords.y)

    let returnPoints: [Point, Point, Point] = [
        midPoint,
        nOfNW ? cornerCords[1]! : cornerCords[3]!,
        nOfNE ? cornerCords[0]! : cornerCords[2]!
    ]

    const returnPos: [number, number, number] = [
        gridCords.x,
        gridCords.y,
        Math.abs((+!nOfNW * 3) + (+!nOfNE * -1))
    ]

    return {
        points: returnPoints,
        pos: returnPos,
        corners: cornerCords
    }
}

function drawHover(triData: TriData, imageOffset: number): void {
    ctx.beginPath()
    ctx.moveTo(triData.points[0].x + imageOffset, triData.points[0].y + imageOffset)
    ctx.lineTo(triData.points[1].x + imageOffset, triData.points[1].y + imageOffset)
    ctx.lineTo(triData.points[2].x + imageOffset, triData.points[2].y + imageOffset)
    ctx.closePath()
    ctx.lineWidth = 0
    ctx.fillStyle = mouseDown ? activeColor : hoverColor
    ctx.fill()
}

async function constructCompletedSqaure(imageData: ImageData, triData: TriData, pxPerGrid: number): Promise<ImageData> {
    const triPos: number = triData.pos[2]

    const cornerPoints = triData.corners.map((element, i) => {
        return {
            x: i === 0 || i === 3 ? element.x : element.x - 1,
            y: i === 0 || i === 1 ? element.y : element.y - 1
        }
    })

    const pointMain: Point = cornerPoints[triPos]!
    const rowStart: number = triPos % 2 === 0 ? pointMain.y : pointMain.x
    const colStart: number = triPos % 2 === 0 ? pointMain.x : pointMain.y

    console.log(rowStart, colStart)
    console.log(imageData.width, imageData.height)

    const rowDir: number = (triPos === 0 || triPos === 3) ? 1 : -1
    const colDir: number = (triPos === 0 || triPos === 1) ? 1 : -1

    let returnImage: ImageData = new ImageData(pxPerGrid, pxPerGrid)

    for (let cols: number = (pxPerGrid - 1), row: number = 0; cols > 0; cols--, row++) {
        for (let col: number = row; col < cols; col++) {
            const getRow = rowStart + (row * rowDir)
            const getCol = colStart + (col * colDir)

            const color: RGBA = getPixelColor(imageData, triPos % 2 === 0 ? getCol : getRow, triPos % 2 === 0 ? getRow : getCol)

            /* Non Inverted
            const placePoints: [Point, Point, Point, Point] = [
                {
                    x: col,
                    y: row
                }, {
                    x: (pxPerGrid - 1) - row,
                    y: col
                }, {
                    x: (pxPerGrid - 1) - col,
                    y: (pxPerGrid - 1) - row
                }, {
                    x: row,
                    y: (pxPerGrid - 1) - col,
                }
            ]
            */

            const placePoints: [Point, Point, Point, Point] = [
                {
                    x: col,
                    y: row
                }, {
                    x: (pxPerGrid - 1) - row,
                    y: ((pxPerGrid - 1) - col) - 1,
                }, {
                    x: (pxPerGrid - 1) - col,
                    y: (pxPerGrid - 1) - row
                }, {
                    x: row,
                    y: col + 1
                }
            ]

            for (const point of placePoints) {
                setPixelColor(
                    returnImage,
                    point.x,
                    point.y,
                    color
                )
            }
        }
    }

    return returnImage
}

export function letUserPreview(normalizedImageData: ImageData, xGridAmt: number, yGridAmt: number): Promise<void> {
    return new Promise((resolve) => {
        const imageW = normalizedImageData.width
        const imageH = normalizedImageData.height
        const imageOffset = imageW * LINE_WEIGHT
        const cavnasW = imageW + imageOffset * 2
        const canvasH = imageH + imageOffset * 2

        const pxPerGrid: number = imageW / xGridAmt

        canvas.width = cavnasW
        canvas.height = canvasH

        completeCanvas.width = pxPerGrid
        completeCanvas.height = pxPerGrid

        canvas.addEventListener("pointermove", onPointerMove)
        canvas.addEventListener("pointerdown", onPointerDown)
        canvas.addEventListener("pointerup", onPointerUp)

        previewSwapColorButton.addEventListener("click", swapColorPress)

        let completeFunctionWorking = false

        async function update(): Promise<void> {
            ctx.putImageData(normalizedImageData, imageOffset, imageOffset)

            const triData = getTriData(pxPerGrid)

            drawHover(triData, imageOffset)
            drawTriGrid(
                cavnasW, canvasH,
                imageW, imageH,
                xGridAmt, yGridAmt
            )

            if (mouseDown && !mouseDownLast && !completeFunctionWorking) {
                completeFunctionWorking = true
                try {
                    const completeSquareData: ImageData = await constructCompletedSqaure(normalizedImageData, triData, pxPerGrid) // TODO thread + async
                    console.log("Done")
                    completeTX.putImageData(completeSquareData, 0, 0)
                } finally {
                    completeFunctionWorking = false
                }
            }

            mouseDownLast = mouseDown

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
