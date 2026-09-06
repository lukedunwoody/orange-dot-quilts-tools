// Step One Helper
import { showStep } from "./steps";

const dropZone = document.getElementById("drop-zone") as HTMLDivElement;
const inputImage = document.getElementById("input-image") as HTMLInputElement
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement
const uploadStatus = document.getElementById("upload-status") as HTMLParagraphElement
const uploadFinishButton = document.getElementById("upload-finish-button") as HTMLButtonElement
const UploadBackButton = document.getElementById("upload-back-button") as HTMLButtonElement

function setImage(file: File | undefined): void {
    if (!file || !file.type.startsWith("image/")) return

    uploadedImage.src = URL.createObjectURL(file)
    showStep("selected-image")
}

function inputImageChange(): void {
    setImage(inputImage.files?.[0])
}

function click(): void {
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

    setImage(e.dataTransfer?.files[0])
}

function backButtonPress(): void {
    showStep("upload")
}

export function getImageUpload(): Promise<string> {
    return new Promise((resolve) => {
        uploadedImage.src = "../assets/placeholder.png"

        dropZone.addEventListener("dragover", dragOver)
        dropZone.addEventListener("dragleave", dragLeave)
        dropZone.addEventListener("drop", drop)
        dropZone.addEventListener("click", click)

        UploadBackButton.addEventListener("click", backButtonPress)
        inputImage.addEventListener("change", inputImageChange)

        uploadFinishButton.onclick = () => {
            const imageUrl = uploadedImage.getAttribute("src") as string

            if (uploadedImage.getAttribute("src") && imageUrl !== "../assets/placeholder.png") {
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
