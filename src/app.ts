// Step 1
const uploadButton = document.getElementById("upload-button") as HTMLButtonElement
const inputImage = document.getElementById("input-image") as HTMLInputElement
const uploadedImage = document.getElementById("uploaded-image") as HTMLImageElement

uploadButton.onclick = () => {
    inputImage.click()
}

inputImage.onchange = () => {
    const file = inputImage.files?.[0]

    if (file) {
        uploadedImage.src = URL.createObjectURL(file)
    }
}
