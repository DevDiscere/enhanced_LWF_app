const createImageObject = function createImageObject (fileList) {
    class ImageObject {
        constructor(imageFile, imageURL) {
            this.imageFile = imageFile;
            this.imageURL = imageURL;
        }
    }

    const imageObjects = [];

    // Create an object containing the file and generated object url
    for (const file of fileList) {
        const imageObject = new ImageObject(file, URL.createObjectURL(file));
        imageObjects.push(imageObject);
    }

    return imageObjects;
}

const createSVG = function createSVG (icon) {
    if (icon == "photo") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "size-6");

        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("d", "M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z");
        path.setAttribute("clip-rule", "evenodd");

        svg.appendChild(path);

        return svg;
    }

    if (icon == "x-mark") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "size-6");

        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("d", "M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z");
        path.setAttribute("clip-rule", "evenodd");

        svg.appendChild(path);

        return svg;
    }
}

const showUploadedFiles = function showUploadedFiles (uploadedFiles) {
    const createFilePreview = function createFilePreview (imageURL, imageFileName, container) {
        const filePreview = document.createElement("li");
        const fileLogo = createSVG("photo");
        const fileName = document.createElement("p");
        const deleteButton = document.createElement("button");
        const deleteLogo = createSVG("x-mark");

        filePreview.classList.add("file-preview");
        filePreview.dataset.url = imageURL;

        fileLogo.classList.add("file-logo");
        filePreview.appendChild(fileLogo)

        fileName.textContent = imageFileName;
        filePreview.appendChild(fileName);
        
        deleteButton.classList.add("delete-button");
        deleteButton.appendChild(deleteLogo);
        filePreview.appendChild(deleteButton);

        container.appendChild(filePreview);
    }

    const createImagePreview = function createImagePreview (imageURL, imageFileName, container) {
        const image = document.createElement("img");

        image.src = imageURL;
        image.alt = imageFileName;
        image.dataset.url = imageURL;

        container.appendChild(image);
    }

    const fileContainer = document.querySelector(".file-container");
    const imageContainer = document.querySelector(".image-container");

    // Show the image preview
    imageContainer.style.opacity = 1;

    uploadedFiles.forEach( (file) => {
        const imageFileName = file.imageFile.name;
        const imageURL = file.imageURL;

        createFilePreview(imageURL, imageFileName, fileContainer);
        createImagePreview(imageURL, imageFileName, imageContainer);
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach( (button) => {
        button.addEventListener("click", () => {
            const filePreview = button.closest(".file-preview");
            const imageURL = filePreview.dataset.url;

            // Find the matching img element using data-url
            const image = imageContainer.querySelector(`img[data-url="${imageURL}"]`);

            if (image) {
                // Revoke the object URL to release memory
                URL.revokeObjectURL(image.src);
                image.remove();
            }

            filePreview.remove();

            // Remove the image from global image storage
            const imageIndex = imagesInStorage.findIndex(image => image.imageURL === imageURL);
            if (imageIndex !== -1) {
                imagesInStorage.splice(imageIndex, 1);
            }
        });
    });
}

const uploadAndDisplayFiles = function uploadAndDisplayFiles () {
    const maxUploadFiles = 5;
    const filesToProcess = fileUploader.files;

    if (filesToProcess.length === 0) {
        alert("Please select at least one file to upload.");
        return;
    }

    const totalAfterUpload = imagesInStorage.length + filesToProcess.length;

    if (totalAfterUpload <= maxUploadFiles) {
        // Create object to store file and file url
        const uploadedImages = createImageObject(filesToProcess);

        // Store uploaded files in global image storage
        uploadedImages.forEach(image => imagesInStorage.push(image));

        // Display file details in sidebar
        showUploadedFiles(uploadedImages);
    } else {
        alert(`You can only upload ${maxUploadFiles} files in total. You already have ${imagesInStorage.length}.`);
    }

    // Reset uploader to allow re-uploading of same files
    fileUploader.value = "";
}

const fileUploader = document.querySelector("#file-uploader");
let imagesInStorage = [];

fileUploader.addEventListener("change", uploadAndDisplayFiles);
