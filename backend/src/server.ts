import { createServer } from "node:http"

import { encodeNormalize, decodeNormalize, encodeImageData, decodeImageData } from "@odq-tri-cropper/shared"

import { normalizeImage } from "./normalize.js"

const PX_PER_GRID = 250

const server = createServer((req, res) => {
    // The Vite frontend runs on a different origin during development.
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.writeHead(204)
        res.end()
        return
    }

    if (req.method === "POST" && req.url === "/api/normalize") {
        console.log(`Recieved request from ${req.url} via ${req.method}`)

        const chunks: Buffer[] = []

        req.on("data", chunk => {
            chunks.push(chunk)
        })

        req.on("end", () => {
            const buffer = Buffer.concat(chunks)
            const arrayBuffer = buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength,
            )

            const requestData = decodeNormalize(arrayBuffer)
            const normalizedImageData = normalizeImage(
                requestData.imageData,
                requestData.pointsData.points,
                requestData.pointsData.gridWidth * PX_PER_GRID,
                requestData.pointsData.gridHeight * PX_PER_GRID
            )

            const result = encodeImageData(normalizedImageData)

            res.writeHead(200, {
                "Content-Type": "application/octet-stream"
            })

            res.end(Buffer.from(result))
        })

        return
    }

    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not found")
})

server.listen(3000, () => {
    console.log("Backend listening on http://localhost:3000")
})
