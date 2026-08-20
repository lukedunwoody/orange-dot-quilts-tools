import type { Circle, QuadCircles } from "./corners"

const OUTPUT_W: number = 1000
const OUTPUT_H: number = 1000

interface Point {
    x: number,
    y: number
}

export function normalizeImage(image: ImageData, circlePositions: QuadCircles): ImageData {
    const nwCircle = circlePositions[0]!
    const neCircle = circlePositions[1]!
    const seCircle = circlePositions[2]!
    const swCircle = circlePositions[3]!

    let rises: number[] = []
    let runs: number[] = []

    for (let i: number = 0; i < 4; i++) {
        const circle0: Circle = circlePositions[i]!
        const circle1: Circle = circlePositions[(i+1)%4]!

        rises[i] = circle1.y - circle0.y
        runs[i] = circle1.x - circle0.x
    }

    let n0: Point = {
        x: circlePositions[0]!.x,
        y: circlePositions[0]!.y
    }
    let s0: Point = {
        x: circlePositions[2]!.x + runs[2]!,
        y: circlePositions[2]!.y + rises[2]!
    }
    let run0  = s0.x - n0.y
    let rise0 = s0.y - n0.y

    for (let i: number = 1; i < OUTPUT_W; i++) {
        const n1: Point = {
            x: circlePositions[0]!.x + (runs[0]!  * (i / OUTPUT_W)),
            y: circlePositions[0]!.y + (rises[0]! * (i / OUTPUT_W))
        }
        const s1: Point = {
            x: circlePositions[2]!.x + (runs[2]!  * ((OUTPUT_W - i) / OUTPUT_W)),
            y: circlePositions[2]!.y + (rises[2]! * ((OUTPUT_W - i) / OUTPUT_W))
        }
        const run1  = s1.x - n1.y
        const rise1 = s1.y - n1.y

        let ne: Point = {
            x: n0.x,
            y: n0.y
        }
        let nw: Point = {
            x: n1.x,
            y: n1.y
        }

        for (let j: number = 1; j < OUTPUT_H; j++) {
            const sw: Point = {
                x: n1.x + (run1  * (j / OUTPUT_H)),
                y: n1.y + (rise1 * (j / OUTPUT_H))
            }
            const se: Point = {
                x: n0.x + (run0 * (j  / OUTPUT_H)),
                y: n0.y + (rise0 * (j / OUTPUT_H))
            }




            ne = se
            nw = sw
        }



        n0 = n1
        s0 = s1
        run0 = run1
        rise0 = rise1
    }
}
