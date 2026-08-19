const upload_button = document.getElementById("upload-button") as HTMLButtonElement;
const input_image = document.getElementById("input-image") as HTMLInputElement;
const uploaded_image = document.getElementById("uploaded-image") as HTMLImageElement;

upload_button.onclick = function () {
    console.log("button clicked");
    input_image.click();
};

input_image.onchange = function () {
    const file = input_image.files?.[0];

    if (file) {
        uploaded_image.src = URL.createObjectURL(file);
    }
};
