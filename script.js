const displayImagePreview = function displayImagePreview () {
    const maxUploadedImages = 5;
    const uploadedImages = fileUploader.files;
    const imagePreview = document.querySelector(".image-preview");

    // Clear images of image preview
    while (imagePreview.firstChild) {
        imagePreview.removeChild(imagePreview.firstChild);
    }

    if (uploadedImages.length != 0 && uploadedImages.length <= maxUploadedImages) {
        test = uploadedImages;
        test2 = fileUploader.value;
        imagePreview.style.opacity = 1;

        for (const imageFile of uploadedImages) {
            const image = document.createElement("img");

            image.src = URL.createObjectURL(imageFile);
            image.alt = imageFile.name;
            imagePreview.appendChild(image);
        }

    } else if (uploadedImages.length > maxUploadedImages) {
        fileUploader.value = "";
        alert(`You uploaded images more than the maximum upload of ${maxUploadedImages} images`);
    }
    // Edge case where the fileUploader clears the uploaded images because user cancels adding files.
}

const fileUploader = document.querySelector("#file-uploader");

fileUploader.addEventListener("change", displayImagePreview);
fileUploader.addEventListener("cancel", () => alert("Cancelled"));
