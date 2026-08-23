import type { Circle, QuadCircles } from "./corners"

const OUTPUT_W: number = 1000
const OUTPUT_H: number = 1000

interface Point {
    x: number,
    y: number
}

interface RGBA {
    r: number,
    g: number,
    b: number,
    a: number
}

function getPixelColor(imageData: ImageData, x: number, y: number): RGBA {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
        throw new Error("Coordinates are out of bounds");
    }
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index]!,     // Red (0-255)
        g: imageData.data[index + 1]!, // Green (0-255)
        b: imageData.data[index + 2]!, // Blue (0-255)
        a: imageData.data[index + 3]!  // Alpha/Opacity (0-255)
    };
}

export function normalizeImage(image: ImageData, circlePositions: QuadCircles): ImageData {
    // x and y of items in circle positions are already normalized between 0 and 1

    let inputImageW: number = image.width
    let inputImageH: number = image.height

    let returnImage: ImageData = new ImageData(OUTPUT_W, OUTPUT_H)

    // Rises and runs for original 4 lines
    let rises: number[] = []
    let runs: number[] = []

    for (let i: number = 0; i < 4; i++) {
        const circle0: Circle = circlePositions[i]!
        const circle1: Circle = circlePositions[(i+1)%4]!

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

    for (let i: number = 1; i < OUTPUT_W; i++) {
        // Move 1 pixel to the right on the output image
        const n1: Point = {
            x: circlePositions[0]!.x + (runs[0]!  * (i / OUTPUT_W)),
            y: circlePositions[0]!.y + (rises[0]! * (i / OUTPUT_W))
        }
        const s1: Point = {
            x: circlePositions[2]!.x + (runs[2]!  * ((OUTPUT_W - i) / OUTPUT_W)),
            y: circlePositions[2]!.y + (rises[2]! * ((OUTPUT_W - i) / OUTPUT_W))
        }
        const run1  = s1.x - n1.x
        const rise1 = s1.y - n1.y

        // n0, s0, n1, s1 make a box that is 1/OUTPUT_W wide (0-1)
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

        for (let j: number = 1; j < OUTPUT_H; j++) {
            // These are the bottom points of each individual pixel grid
            percentGridPoints[2] = {
                x: n1.x + (run1 * (j / OUTPUT_H)),
                y: n1.y + (rise1 * (j / OUTPUT_H))
            }
            percentGridPoints[3] = {
                x: n0.x + (run0 * (j / OUTPUT_H)),
                y: n0.y + (rise0 * (j / OUTPUT_H))
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

            const pxInsideW: number = eMostEdge - wMostEdge
            const pxInsideH: number = sMostEdge - nMostEdge

            // Step 3: Weigh each input pixel by how much they inside output grid
            // Find area of output pixel inside input grid by:
            // - Finding any output points inside input grid
            // - Finding any intercepts between input and output lines
            // Then use shoelace formula to find area inside

            let pxInsideVector: [[RGBA, number]] = [[{r: 0, g: 0, b: 0, a: 0}, 0]]

            for (let ii: number = 0; ii < pxInsideW; ii++) {
                for (let jj: number = 0; jj < pxInsideH; jj++) {

                    let points: Point[] = []

                    // Input edge pos mapped to when its needed
                    const inputEdges: number[] = [
                        ii,
                        jj,
                        ii + 1,
                        jj + 1
                    ]

                    // Loop through each output corner
                    for (let kk: number = 0; kk < 4; kk++) {
                        const corner0: Point = inputGridPoints[kk]!

                        // Check if point is inside circle by
                        // finding the 2 comparison input edges and
                        // weather they would be higher or lower than the point
                        const riseEdge: number = inputEdges[kk]!
                        const runEdge: number  = inputEdges[kk+1]!

                        const runAxisX: boolean = kk % 2 === 0

                        const riseEdgeLowerMeansInside: boolean = kk === 0 || kk === 3
                        const runEdgeLowerMeansInside: boolean  = kk === 0 || kk === 1

                        const riseComparison: number = runAxisX ? corner0.y : corner0.x
                        const runComparison: number  = runAxisX ? corner0.x : corner0.y

                        const riseEdgeInside: boolean = riseEdgeLowerMeansInside ? riseEdge < riseComparison : riseEdge > riseComparison
                        const runEdgeInside: boolean = runEdgeLowerMeansInside ? runEdge < runComparison : runEdge > runComparison

                        if (riseEdgeInside && runEdgeInside) {
                            points.push(corner0)
                        }

                        // Find any intercepts between this point and the next
                        // See if they cross ii or ii+1 between jj and jj+1
                        // or  if they cross jj or jj+1 between ii and ii+1
                        // Add cords of any intercepts to points array
                        const corner1: Point = inputGridPoints[(kk+1)%4]!

                        const swapAxes = kk % 2 !== 0

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
                            const interceptEdge: number = inputEdges[ll]!

                            const eLocalEdge: number = inputEdges[(ll+1)%4]! // jj
                            const wLocalEdge: number = inputEdges[(ll+3)%4]! // jj+1

                            // Intercept edge is on x-axis
                            if (localCorner0.x === localCorner1.x) {
                                if (localCorner0.x >= eLocalEdge && localCorner0.x <= wLocalEdge) {
                                    addLocalPoint({
                                        x: localCorner0.x,
                                        y: interceptEdge
                                    })
                                }
                            } else if (localCorner0.y === localCorner1.y && localCorner1.y === interceptEdge) {
                                // Both points on interceptEdge

                                if (localCorner0.x < wLocalEdge) {
                                    addLocalPoint({
                                        x: (localCorner0.x > eLocalEdge) ? localCorner0.x : eLocalEdge,
                                        y: interceptEdge
                                    })
                                }
                                if (localCorner1.x > eLocalEdge) {
                                    addLocalPoint({
                                        x: (localCorner1.x < wLocalEdge) ? localCorner1.x : wLocalEdge,
                                        y: interceptEdge
                                    })
                                }
                            } else if ((localCorner0.y >= interceptEdge && localCorner1.y <= interceptEdge) ||
                                (localCorner0.y <= interceptEdge && localCorner1.y >= interceptEdge))
                            {
                                const m = (localCorner1.y - localCorner0.y) / (localCorner1.x - localCorner0.x)
                                const b = localCorner0.y

                                const relativeInterceptX = (interceptEdge - b) / m

                                addLocalPoint({
                                    x: localCorner0.x + relativeInterceptX,
                                    y: interceptEdge
                                })
                            }
                        }
                    }

                    pxInsideVector.push([getPixelColor(image, wMostEdge+ii, nMostEdge+jj), shoelaceArea(points)])
                }
            }

            // Step 4: Average out the colors using hslX
            // Step 5: Write weighed color to (i, j) in return image

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
