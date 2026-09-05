// Step One Helper

const dropZone = document.getElementById("drop-zone") as HTMLDivElement;
const inputImage = document.getElementById("input-image") as HTMLInputElement
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement
const uploadStatus = document.getElementById("upload-status") as HTMLParagraphElement
const uploadSelectButton = document.getElementById("upload-select-button") as HTMLButtonElement
const uploadFinishButton = document.getElementById("upload-finish-button") as HTMLButtonElement

function inputImageChange(): void {
    const file = inputImage.files?.[0]

    if (file) {
        uploadedImage.src = URL.createObjectURL(file)
    }
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

    const file = e.dataTransfer?.files?.[0]

    if (file) {
        uploadedImage.src = URL.createObjectURL(file)
    }
}

export function getImageUpload(): Promise<string> {
    return new Promise((resolve) => {
        uploadedImage.src = "../assets/placeholder.png"

        dropZone.addEventListener("dragover", dragOver)
        dropZone.addEventListener("dragleave", dragLeave)
        dropZone.addEventListener("drop", drop)
        dropZone.addEventListener("click", click)

        uploadSelectButton.addEventListener("click", click)
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

                uploadSelectButton.removeEventListener("click", click)
                inputImage.removeEventListener("change", inputImageChange)

                resolve(imageUrl)
            } else {
                uploadStatus.textContent = "Please upload an image before continuing."
                uploadStatus.className = "failed"
            }
        }
    })
}
