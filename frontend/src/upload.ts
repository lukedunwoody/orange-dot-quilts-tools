// Step One Helper

const inputImage = document.getElementById("input-image") as HTMLInputElement
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement
const uploadStatus = document.getElementById("upload-status") as HTMLParagraphElement
const uploadSelectButton = document.getElementById("upload-select-button") as HTMLButtonElement
const uploadFinishButton = document.getElementById("upload-finish-button") as HTMLButtonElement

export function getImageUpload(): Promise<string> {
    return new Promise((resolve) => {
        uploadSelectButton.onclick = () => {
            inputImage.click()
        }

        inputImage.onchange = () => {
            const file = inputImage.files?.[0]

            if (file) {
                uploadedImage.src = URL.createObjectURL(file)
            }
        }

        uploadFinishButton.onclick = () => {
            const imageUrl = uploadedImage.getAttribute("src") as string

            if (uploadedImage.getAttribute("src")) {
                uploadStatus.textContent = ""
                uploadStatus.className = "empty"
                resolve(imageUrl)
            } else {
                uploadStatus.textContent = "Please upload an image before continuing."
                uploadStatus.className = "failed"
            }
        }
    })
}
