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

const createForm = function createForm(imageURL) {
    const uniqueId = imageURL.replace(/\W/g, ""); // Consistent ID

    const createToggleSwitch = function createToggleSwitch(formLabel, uniqueId) {
        const formattedFormLabel = `${formLabel.toLowerCase().replace(/\s+/g, "-")}-${uniqueId}`;
        const divContainer = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        const sliderSpan = document.createElement("span");
        const textLabel = document.createElement("span");
    
        divContainer.classList.add("form-component", "toggle-switch");
    
        input.setAttribute("type", "checkbox");
        input.id = formattedFormLabel;
        input.name = `show-visualizations-${uniqueId}`;
        input.value = "true";
        input.classList.add("toggle-input");
    
        label.classList.add("switch-label");
        label.setAttribute("for", formattedFormLabel);
    
        sliderSpan.classList.add("slider");
        textLabel.classList.add("toggle-text");
        textLabel.textContent = formLabel;
    
        label.appendChild(sliderSpan);
    
        // Order is important: input -> label (so the CSS selector works)
        divContainer.appendChild(input);
        divContainer.appendChild(label);
        divContainer.appendChild(textLabel);
    
        return divContainer;
    };

    const createFormComponent = function createFormComponent(formType, formLabel, initialValue = 0, minValue = 0, maxValue = 0) {
        const formattedFormLabel = `${formLabel.toLowerCase().replace(" ", "-").replace(":", "")}-${uniqueId}`;
        const name = formattedFormLabel;
    
        const divContainer = document.createElement("div");
        const label = document.createElement("label");
        const input = document.createElement("input");
    
        label.htmlFor = formattedFormLabel;
        label.textContent = formLabel;
    
        input.setAttribute("type", formType);
        input.id = formattedFormLabel;
        input.name = name;
        input.defaultValue = initialValue;
        input.min = minValue;
        input.max = maxValue;
        input.classList.add("number-input");  // Add a class for styling
    
        divContainer.classList.add("form-component");
        divContainer.append(label);
        divContainer.append(input);
    
        // If it's a range, show the value beside it
        if (formType === "range") {
            input.classList.add("range-input");
    
            const valueDisplay = document.createElement("span");
            valueDisplay.classList.add("range-value");
            valueDisplay.textContent = initialValue;
    
            input.addEventListener("input", () => {
                valueDisplay.textContent = input.value;
            });
    
            divContainer.appendChild(valueDisplay);
        }
    
        return divContainer;
    };

    const formContainer = document.createElement("form");

    formContainer.method = "POST";
    formContainer.action = "/process-image";
    formContainer.encType = "multipart/form-data";
    formContainer.imageFile = imagesInStorage.find(img => img.imageURL === imageURL)?.imageFile;
    formContainer.classList.add("form-container");

    const toggleComponent = createToggleSwitch("Show Visualizations", uniqueId);
    const maxIterationsComponent = createFormComponent("number", "Max Iterations:", 3, 3, Infinity);
    const penumbraSizeComponent = createFormComponent("number", "Penumbra Size:", 2, 2, Infinity);
    const upperBoundsComponent = createFormComponent("range", "Upper Bounds:", 16, 1, 256);
    const formSubmit = document.createElement("input");

    formSubmit.setAttribute("type", "submit");
    formSubmit.value = "Submit";
    formSubmit.classList.add("form-submit");

    const divContainer = document.createElement("div");
    divContainer.classList.add("div-container");
    divContainer.appendChild(maxIterationsComponent);
    divContainer.appendChild(penumbraSizeComponent);

    formContainer.appendChild(toggleComponent);
    formContainer.appendChild(divContainer);
    formContainer.appendChild(upperBoundsComponent);
    formContainer.appendChild(formSubmit);

    formContainer.addEventListener("submit", (e) => {
        e.preventDefault();
    
        const form = e.target;
        const formData = new FormData();
    
        const fileObj = form.imageFile;
    
        if (!fileObj) {
            console.error("No image file found for form submission");
            return;
        }
    
        formData.append("image", fileObj);
        formData.append("show_visualizations", form.elements[`show-visualizations-${uniqueId}`]?.checked ? "true" : "false");
        formData.append("max_iterations", form.elements[`max-iterations-${uniqueId}`]?.value);
        formData.append("penumbra_size", form.elements[`penumbra-size-${uniqueId}`]?.value);
        formData.append("upper_bounds", form.elements[`upper-bounds-${uniqueId}`]?.value);
    
        console.log("🧪 Submitting Form Data:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
    
        fetch("/process", {
            method: "POST",
            body: formData,
        })
        .then(res => {
            if (!res.ok) throw new Error("Server returned an error");
            return res.blob();
        })
        .then(blob => {
            const outputImg = form.closest(".tab-content").querySelector(".image-holder:nth-child(2)");
            const img = document.createElement("img");
            img.src = URL.createObjectURL(blob);
            img.alt = "Processed Image";
            img.classList.add("output-image");
    
            outputImg.replaceChildren();
            outputImg.appendChild(img);
        })
        .catch(err => console.error("Processing failed", err));
    });    

    return formContainer;
};

const showUploadedFiles = function showUploadedFiles (uploadedFiles) {
    const createHTMLComponent = function createHTMLComponent (imageURL, imageFileName, container, type) {
        if (type == "file") {
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

        if (type == "tab-button") {
            const tabButton = document.createElement("button");

            tabButton.classList.add("tab-link");
            tabButton.textContent = imageFileName;
            tabButton.dataset.url = imageURL;

            container.appendChild(tabButton);
        }

        if (type == "tab-section") {
            const tabSection = document.createElement("section");
            const inputImage = document.createElement("img");
            const inputDiv = document.createElement("div");
            const outputDiv = document.createElement("div");
            const imageContainer = document.createElement("div");
            const formComponent = createForm(imageURL);

            tabSection.dataset.url = imageURL;
            tabSection.classList.add("tab-content");

            inputImage.src = imageURL;
            inputImage.alt = imageFileName;
            inputImage.dataset.url = imageURL;
            inputImage.classList.add("input-image");

            inputDiv.classList.add("image-holder");
            outputDiv.classList.add("image-holder");

            imageContainer.classList.add("image-container");

            inputDiv.appendChild(inputImage);
            imageContainer.appendChild(inputDiv);
            imageContainer.appendChild(outputDiv);
            tabSection.appendChild(imageContainer);
            tabSection.appendChild(formComponent);
            container.appendChild(tabSection);
        }
    }

    const fileContainer = document.querySelector(".file-container");
    const tabButtonContainer = document.querySelector(".tab-button-container");
    const tabSectionContainer = document.querySelector(".tab-section-container");

    uploadedFiles.forEach( (file) => {
        const imageFileName = file.imageFile.name;
        const imageURL = file.imageURL;

        createHTMLComponent(imageURL, imageFileName, fileContainer, "file");
        createHTMLComponent(imageURL, imageFileName, tabButtonContainer, "tab-button");
        createHTMLComponent(imageURL, imageFileName, tabSectionContainer, "tab-section");
    });

    tabSectionContainer.firstElementChild?.classList.add("open");
    tabButtonContainer.firstElementChild?.classList.add("active");

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filePreview = button.closest(".file-preview");
            const imageURL = filePreview.dataset.url;

            const tabButton = tabButtonContainer.querySelector(`button[data-url="${imageURL}"]`);
            const tabSection = tabSectionContainer.querySelector(`section[data-url="${imageURL}"]`);
            const image = tabSectionContainer.querySelector(`img[data-url="${imageURL}"]`);

            const isActive = tabButton.classList.contains("active");

            if (image) {
                // Release memory reference to the image
                URL.revokeObjectURL(image.src);
                image.remove();
            }

            tabButton.remove();
            tabSection.remove();
            filePreview.remove();

            // Remove from global storage
            const imageIndex = imagesInStorage.findIndex(image => image.imageURL === imageURL);
            if (imageIndex !== -1) {
                imagesInStorage.splice(imageIndex, 1);
            }

            // ✅ If deleted tab was active, activate the next one
            if (isActive) {
                const remainingTabButtons = tabButtonContainer.querySelectorAll(".tab-link");
                const remainingTabSections = tabSectionContainer.querySelectorAll(".tab-content");

                if (remainingTabButtons.length > 0) {
                    remainingTabButtons[0].classList.add("active");
                    remainingTabSections[0].classList.add("open");
                }
            }
        });
    });

    const tabButtons = document.querySelectorAll(".tab-link");
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Remove "open" from the currently active tab section
            const activeTabSection = document.querySelector(".tab-content.open");
            activeTabSection?.classList.remove("open");

            // Remove "active" from the currently active tab button
            const activeTabButton = document.querySelector(".tab-link.active");
            activeTabButton?.classList.remove("active");

            // Get URL from clicked button and update tab content
            const clickedTabButton = button.closest(".tab-link");
            const imageURL = clickedTabButton.dataset.url;

            // Activate the clicked button and corresponding tab section
            clickedTabButton.classList.add("active");
            const correspondingTabSection = tabSectionContainer.querySelector(`section[data-url="${imageURL}"]`);
            correspondingTabSection?.classList.add("open");
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
