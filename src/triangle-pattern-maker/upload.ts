// Step One Helper
import { showStep } from "./steps"
import { resizeImageUrl, urlToImage } from "./imageUtils";

const dropZone = document.getElementById("drop-zone") as HTMLDivElement
const inputImage = document.getElementById("input-image") as HTMLInputElement
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement
const uploadStatus = document.getElementById("upload-status") as HTMLParagraphElement
const uploadFinishButton = document.getElementById("upload-finish-button") as HTMLButtonElement
const UploadBackButton = document.getElementById("upload-back-button") as HTMLButtonElement

async function setImage(file: File | undefined): Promise<void> {
    if (!file || !file.type.startsWith("image/")) {
        window.alert("Please choose an image file and try again.")
        return
    }

    const sourceUrl = URL.createObjectURL(file)

    try {
        const image = await urlToImage(sourceUrl)
        uploadedImage.src = resizeImageUrl(image)
        uploadStatus.textContent = ""
        uploadStatus.className = "empty"
        showStep("selected-image")
    } catch (error) {
        console.error("Unable to load uploaded image", error)
        uploadedImage.src = "/images/placeholder.png"
        uploadStatus.textContent = "That image could not be loaded. Please choose a different image."
        uploadStatus.className = "failed"
        showStep("selected-image")
    } finally {
        URL.revokeObjectURL(sourceUrl)
    }
}

function inputImageChange(): void {
    void setImage(inputImage.files?.[0])
}

function click(e: MouseEvent): void {
    // The file input is inside the drop zone, so its synthetic click would
    // otherwise bubble back here and trigger another input click.
    if (e.target === inputImage) return

    inputImage.click()
}

function dragOver(e: DragEvent): void {
    e.preventDefault()
    dropZone.classList.add("dragover")
}

function dragLeave(): void {
    dropZone.classList.remove("dragover")
}

function drop(e: DragEvent): void {
    e.preventDefault()
    dropZone.classList.remove("dragover")

    void setImage(e.dataTransfer?.files[0])
}

function backButtonPress(): void {
    showStep("upload")
}

export function getImageUpload(): Promise<string> {
    return new Promise((resolve) => {
        uploadedImage.src = "/images/placeholder.png"
        inputImage.value = ""

        dropZone.addEventListener("dragover", dragOver)
        dropZone.addEventListener("dragleave", dragLeave)
        dropZone.addEventListener("drop", drop)
        dropZone.addEventListener("click", click)

        UploadBackButton.addEventListener("click", backButtonPress)
        inputImage.addEventListener("change", inputImageChange)

        uploadFinishButton.onclick = () => {
            const imageUrl = uploadedImage.getAttribute("src") as string

            if (uploadedImage.getAttribute("src") && imageUrl !== "/images/placeholder.png") {
                uploadStatus.textContent = ""
                uploadStatus.className = "empty"

                dropZone.removeEventListener("dragover", dragOver)
                dropZone.removeEventListener("dragleave", dragLeave)
                dropZone.removeEventListener("drop", drop)
                dropZone.removeEventListener("click", click)

                UploadBackButton.removeEventListener("click", backButtonPress)
                inputImage.removeEventListener("change", inputImageChange)

                resolve(imageUrl)
            } else {
                uploadStatus.textContent = "Please upload an image before continuing."
                uploadStatus.className = "failed"
            }
        }
    })
}
