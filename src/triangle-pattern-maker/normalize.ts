// Probably some of the most dense math I have ever written
// Sorry in advance to future self or others for the naming

import { getPixelColor, setPixelColor } from "./imageUtils"
import type { Point, RGBA } from "./types"

interface ColorWeight {
    color: RGBA,
    weight: number
}

// DISCLAIMER: The following function was made by an LLM
// It is a simple function that determines if a point is acutally inside a quad
// I'm just tired man
function isPointInsideConvexQuad(point: Point, quad: Point[]): boolean {
    let hasPositiveCrossProduct = false
    let hasNegativeCrossProduct = false

    for (let i: number = 0; i < 4; i++) {
        const edgeStart = quad[i]!
        const edgeEnd = quad[(i + 1) % 4]!
        const crossProduct =
            (edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) -
            (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x)

        hasPositiveCrossProduct ||= crossProduct > 0
        hasNegativeCrossProduct ||= crossProduct < 0
    }

    return !(hasPositiveCrossProduct && hasNegativeCrossProduct)
}

function orderPoints(points: Point[]): Point[] {
    let xTotal: number = 0
    let yTotal: number = 0

    for (const point of points) {
        xTotal += point.x
        yTotal += point.y
    }

    const centroid: Point = {
        x: xTotal / points.length,
        y: yTotal / points.length
    }

    points.sort((a, b) => {
        const ay = a.y - centroid.y
        const ax = a.x - centroid.x

        const by = b.y - centroid.y
        const bx = b.x - centroid.x

        return Math.atan2(ay, ax) - Math.atan2(by, bx)
    })

    return points
}

function shoelaceArea(points: Point[]): number {
    points = orderPoints(points)

    let sum0: number = 0
    let sum1: number = 0

    for (let i: number = 0; i < points.length; i++) {
        sum0 += points[i]!.x * points[(i+1)%points.length]!.y
        sum1 += points[i]!.y * points[(i+1)%points.length]!.x
    }

    return Math.abs(sum0 - sum1) / 2
}

function averageColorsByWeight(colorWeights: ColorWeight[]): RGBA {
    let rt: number = 0
    let gt: number = 0
    let bt: number = 0
    let at: number = 0
    let wt: number = 0

    for (const cw of colorWeights) {
        rt += cw.color.r * cw.weight
        gt += cw.color.g * cw.weight
        bt += cw.color.b * cw.weight
        at += cw.color.a * cw.weight

        wt += cw.weight
    }

    const averagedColor: RGBA = {
        r: rt / wt,
        g: gt / wt,
        b: bt / wt,
        a: at / wt
    }

    return averagedColor
}

export function normalizeImage(image: ImageData, circlePositions: [Point, Point, Point, Point], outputW: number, outputH: number): ImageData {
    // x and y of items in circle positions are already normalized between 0 and 1

    const inputImageW: number = image.width
    const inputImageH: number = image.height

    let returnImage: ImageData = new ImageData(outputW, outputH)

    // Rises and runs for original 4 lines
    let rises: number[] = []
    let runs: number[] = []

    for (let i: number = 0; i < 4; i++) {
        const circle0: Point = circlePositions[i]!
        const circle1: Point = circlePositions[(i+1)%4]!

        rises[i] = circle1.y - circle0.y
        runs[i] = circle1.x - circle0.x
    }

    // Start points for normalization grid (nw and sw)
    let n0: Point = {
        x: circlePositions[0]!.x,
        y: circlePositions[0]!.y
    }
    let s0: Point = {
        x: circlePositions[2]!.x + runs[2]!,
        y: circlePositions[2]!.y + rises[2]!
    }
    let run0  = s0.x - n0.x
    let rise0 = s0.y - n0.y

    for (let i: number = 0; i < outputW; i++) {
        // Move 1 pixel to the right on the output image
        const n1: Point = {
            x: circlePositions[0]!.x + (runs[0]!  * ((i + 1) / outputW)),
            y: circlePositions[0]!.y + (rises[0]! * ((i + 1) / outputW))
        }
        const s1: Point = {
            x: circlePositions[2]!.x + (runs[2]!  * ((outputW - i - 1) / outputW)),
            y: circlePositions[2]!.y + (rises[2]! * ((outputW - i - 1) / outputW))
        }
        const run1  = s1.x - n1.x
        const rise1 = s1.y - n1.y

        // n0, s0, n1, s1 make a box that is 1/outputW wide (0-1)
        // We need to iterate through each row of this column to make
        // a grid for each output pixel mapped to the original image

        // These are the top points of each individual pixel grid
        let percentGridPoints: Point[] = []
        percentGridPoints[0] = {
            x: n0.x,
            y: n0.y
        }
        percentGridPoints[1] = {
            x: n1.x,
            y: n1.y
        }

        for (let j: number = 0; j < outputH; j++) {
            // These are the bottom points of each individual pixel grid
            percentGridPoints[2] = {
                x: n1.x + (run1 * ((j + 1) / outputH)),
                y: n1.y + (rise1 * ((j + 1) / outputH))
            }
            percentGridPoints[3] = {
                x: n0.x + (run0 * ((j + 1) / outputH)),
                y: n0.y + (rise0 * ((j + 1) / outputH))
            }

            // Step 1: Map percentages to original image pixels
            let inputGridPoints: Point[] = []

            for (let i: number = 0; i < percentGridPoints.length; i++) {
                inputGridPoints[i] = {
                    x: percentGridPoints[i]!.x * inputImageW,
                    y: percentGridPoints[i]!.y * inputImageH
                }
            }

            // Step 2: Map corners of pixels inside grid
            const nMostEdge = Math.floor(Math.min(inputGridPoints[1]!.y, inputGridPoints[0]!.y))
            const wMostEdge = Math.floor(Math.min(inputGridPoints[0]!.x, inputGridPoints[3]!.x))

            const sMostEdge = Math.ceil(Math.max(inputGridPoints[3]!.y, inputGridPoints[2]!.y))
            const eMostEdge = Math.ceil(Math.max(inputGridPoints[2]!.x, inputGridPoints[1]!.x))

            // Step 3: Weigh each input pixel by how much they inside output grid
            // Find area of output pixel inside input grid by:
            // - Finding any output points inside input grid
            // - Finding any intercepts between input and output lines
            // Then use shoelace formula to find area inside

            let pxInsideVector: ColorWeight[] = []

            for (let ii: number = wMostEdge; ii <= eMostEdge; ii++) {
                for (let jj: number = nMostEdge; jj <= sMostEdge; jj++) {

                    let points: Point[] = []

                    // Input edge pos mapped to when its needed
                    const inputEdges: number[] = [
                        ii,
                        jj,
                        ii + 1,
                        jj + 1
                    ]
                    const inputPixelCorners: Point[] = [
                        { x: ii,     y: jj },
                        { x: ii + 1, y: jj },
                        { x: ii + 1, y: jj + 1 },
                        { x: ii,     y: jj + 1 }
                    ]

                    // Loop through each output corner
                    for (let kk: number = 0; kk < 4; kk++) {
                        const corner0: Point = inputGridPoints[kk]!

                        const cornerInsideInputPixel =
                            corner0.x >= ii &&
                            corner0.x <= ii + 1 &&
                            corner0.y >= jj &&
                            corner0.y <= jj + 1

                        if (cornerInsideInputPixel) {
                            points.push(corner0)
                        }

                        const inputPixelCorner = inputPixelCorners[kk]!

                        if (isPointInsideConvexQuad(inputPixelCorner, inputGridPoints)) {
                            points.push(inputPixelCorner)
                        }

                        // Find any intercepts between this point and the next
                        // See if they cross ii or ii+1 between jj and jj+1
                        // or  if they cross jj or jj+1 between ii and ii+1
                        // Add cords of any intercepts to points array
                        const corner1: Point = inputGridPoints[(kk+1)%4]!

                        // A slanted output edge can cross either a horizontal or a
                        // vertical input-pixel boundary. Run the same calculation in
                        // both coordinate orientations so both boundary pairs are tested.

                        // DISCLAIMER: line 270 and 289 were written by an LLM but heres how they work
                        // Before, we determined a swapAxes value but failed to account for the fact
                        // that the input edge we needed to compare the line to also changed.
                        // To ensure we don't check all 4 input edges against an axis that might not be theirs,
                        // we determining isLocalYBoundary to see weather the intercept comparison is valid.
                        for (const swapAxes of [false, true]) { // AI
                            const localCorner0: Point = swapAxes
                                ? { x: corner0.y, y: corner0.x }
                                : corner0

                            const localCorner1: Point = swapAxes
                                ? { x: corner1.y, y: corner1.x }
                                : corner1

                            const addLocalPoint = (point: Point) => {
                                points.push(
                                    swapAxes
                                        ? { x: point.y, y: point.x }
                                        : { x: point.x, y: point.y }
                                )
                            }

                            for (let ll: number = 0; ll < 4; ll++) {
                                const isLocalYBoundary = swapAxes ? ll % 2 === 0 : ll % 2 !== 0 // AI

                                if (!isLocalYBoundary) {
                                    continue
                                }

                                const interceptEdge: number = inputEdges[ll]!

                                const minLocalEdge: number = inputEdges[(ll+1)%2]! // jj
                                const maxLocalEdge: number = inputEdges[((ll+1)%2)+2]! // jj+1

                                // Intercept edge is on x-axis
                                if (localCorner0.x === localCorner1.x) {
                                    const segmentMinY = Math.min(localCorner0.y, localCorner1.y)
                                    const segmentMaxY = Math.max(localCorner0.y, localCorner1.y)

                                    if (
                                        localCorner0.x >= minLocalEdge &&
                                        localCorner0.x <= maxLocalEdge &&
                                        interceptEdge >= segmentMinY &&
                                        interceptEdge <= segmentMaxY
                                    ) {
                                        addLocalPoint({
                                            x: localCorner0.x,
                                            y: interceptEdge
                                        })
                                    }
                                } else if (localCorner0.y === localCorner1.y && localCorner1.y === interceptEdge) {
                                    // Both points on interceptEdge

                                    const segmentMinX = Math.min(localCorner0.x, localCorner1.x)
                                    const segmentMaxX = Math.max(localCorner0.x, localCorner1.x)
                                    const overlapMinX = Math.max(segmentMinX, minLocalEdge)
                                    const overlapMaxX = Math.min(segmentMaxX, maxLocalEdge)

                                    if (overlapMinX <= overlapMaxX) {
                                        addLocalPoint({
                                            x: overlapMinX,
                                            y: interceptEdge
                                        })
                                        addLocalPoint({
                                            x: overlapMaxX,
                                            y: interceptEdge
                                        })
                                    }
                                } else if ((localCorner0.y >= interceptEdge && localCorner1.y <= interceptEdge) ||
                                    (localCorner0.y <= interceptEdge && localCorner1.y >= interceptEdge))
                                {
                                    const m = (localCorner1.y - localCorner0.y) / (localCorner1.x - localCorner0.x)
                                    const b = localCorner0.y

                                    const relativeInterceptX = (interceptEdge - b) / m
                                    const interceptX = localCorner0.x + relativeInterceptX

                                    if (interceptX >= minLocalEdge && interceptX <= maxLocalEdge) {
                                        addLocalPoint({
                                            x: interceptX,
                                            y: interceptEdge
                                        })
                                    }
                                }
                            }
                        }
                    }

                    pxInsideVector.push({
                        color: getPixelColor(image, ii, jj),
                        weight: shoelaceArea(points)
                    })
                }
            }

            // Step 4: Average out the colors
            const averageColor: RGBA = averageColorsByWeight(pxInsideVector)

            // Step 5: Write weighed color to (i, j) in return image
            setPixelColor(returnImage, i, j, averageColor)

            percentGridPoints[0] = percentGridPoints[3]!
            percentGridPoints[1] = percentGridPoints[2]!
        }

        n0 = n1
        s0 = s1
        run0 = run1
        rise0 = rise1
    }

    return returnImage
}
