// TODO: Only make circles appear after uploadFinishButton is pressed
// Log circle positions as percent of canvas

// Constants
const CANVAS_WIDTH: number  = 800
const CANVAS_HEIGHT: number = 600
const CIRCLE_OFFSET: number = 0.1
const CIRCLE_DRAW_RADIUS: number   = 10
const CIRCLE_HITBOX_RADIUS: number = 30
const CIRCLE_ACTIVE_COLOR: string  = "#FFFFFF"
const CIRCLE_HOVER_COLOR: string   = "#888888"
const CIRCLE_PASSIVE_COLOR: string = "#000000"

// Step 1 Elements
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement
const uploadFinishButton = document.getElementById("upload-finish-button") as HTMLButtonElement

// Step 2 Elements
const canvas = document.getElementById("corner-align-canvas") as HTMLCanvasElement
canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
const cornerFinishButton = document.getElementById("corner-finish-button") as HTMLButtonElement

interface Circle {
    x: number
    y: number
    state: string
}

let circle_positions: [Circle, Circle, Circle, Circle] = [
    {
        x: CANVAS_WIDTH * CIRCLE_OFFSET,
        y: CANVAS_HEIGHT * CIRCLE_OFFSET,
        state: "passive"
    }, {
        x: CANVAS_WIDTH * (1-CIRCLE_OFFSET),
        y: CANVAS_HEIGHT * CIRCLE_OFFSET,
        state: "passive"
    }, {
        x: CANVAS_WIDTH * (1-CIRCLE_OFFSET),
        y: CANVAS_HEIGHT * (1-CIRCLE_OFFSET),
        state: "passive"
    }, {
        x: CANVAS_WIDTH * CIRCLE_OFFSET,
        y: CANVAS_HEIGHT * (1-CIRCLE_OFFSET),
        state: "passive"
    }
]

const drawCircle = (circle: Circle): void => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, CIRCLE_DRAW_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = circle.state == "active" ? CIRCLE_ACTIVE_COLOR :
        circle.state == "hover" ? CIRCLE_HOVER_COLOR :
        CIRCLE_PASSIVE_COLOR;
    ctx.fill();
    ctx.closePath();
}

const drawCircles = (): void => {
    for (const circle of circle_positions) {
        drawCircle(circle)
    }
}

const drawLine = (circle0: Circle, circle1: Circle): void => {
    ctx.beginPath()
    ctx.moveTo(circle0.x, circle0.y)
    ctx.lineTo(circle1.x, circle1.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = "#00FFFF"
    ctx.stroke()
}

const drawLines = (): void => {
    for (let i: number = 0; i < 4; i++) {
        let circle0: Circle = circle_positions[i]!
        let circle1: Circle = circle_positions[(i+1)%4]!
        drawLine(circle0, circle1)
    }
}

let mouseX: number = 0
let mouseY: number = 0
let mouseLastX: number = 0
let mouseLastY: number = 0
let mouseDiffX: number = 0
let mouseDiffY: number = 0
let mouseDown: boolean = false

function updateCircles(): void {
    for (const circle of circle_positions) {
        if (
            Math.abs(mouseX-circle.x) < CIRCLE_HITBOX_RADIUS
            && Math.abs(mouseY-circle.y) < CIRCLE_HITBOX_RADIUS
        ) {
            if (mouseDown && circle.state == "hover") {
                circle.state = "active"
            } else if (!mouseDown) {
                circle.state = "hover"
            }
        } else {
            circle.state = "passive"
        }
    }
}

function updateMouseDiff(): void {
    mouseDiffX = mouseLastX - mouseX
    mouseDiffY = mouseLastY - mouseY

    mouseLastX = mouseX
    mouseLastY = mouseY
}

canvas.addEventListener("pointermove", (e: PointerEvent) => {
    mouseX = e.offsetX
    mouseY = e.offsetY
})

canvas.addEventListener("pointerdown", (e: PointerEvent) => {
    mouseDown  = true
})

canvas.addEventListener("pointerup", (e: PointerEvent) => {
    mouseDown  = false
})

const update = (): void => {
    if (uploadedImage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(uploadedImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        updateMouseDiff()
        updateCircles()

        for (const circle of circle_positions) {
            if (circle.state == "active") {
                circle.x -= mouseDiffX
                circle.y -= mouseDiffY
            }
        }

        drawLines()
        drawCircles()
    }

    requestAnimationFrame(update)
}

cornerFinishButton.onclick = () => {
    let ne_circle: Circle = circle_positions[0]!
    let nw_circle: Circle = circle_positions[1]!
    let sw_circle: Circle = circle_positions[2]!
    let se_circle: Circle = circle_positions[3]!

    console.log(`NE Circle: x = ${ne_circle.x}, y = ${ne_circle.y}`)
    console.log(`NW Circle: x = ${nw_circle.x}, y = ${nw_circle.y}`)
    console.log(`SW Circle: x = ${sw_circle.x}, y = ${sw_circle.y}`)
    console.log(`SE Circle: x = ${se_circle.x}, y = ${se_circle.y}`)
}

update()
