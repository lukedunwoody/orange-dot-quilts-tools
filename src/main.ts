import { getImageUpload } from "./upload.js"

async function main() {
    console.log("Starting Step 1")

    await getImageUpload()

    console.log("Starting Step 2")
}

main()
