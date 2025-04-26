const fileInput = document.getElementById("fileInput");
const statusDiv = document.getElementById("results");

fileInput.addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
    statusDiv.textContent = '';
    if(event.target.files.length > 0) {
        const file = event.target.files[0];
    } else {
        console.log("No file selected.");
    }
}


function convert() {
    const startOffset = 0x1480;
    console.log("Converting...");

    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.textContent = 'No file selected';
        return;
    }

    const file = fileInput.files[0];

    if (file.size <= startOffset) {
        statusDiv.textContent = 'File is too small to process';
        return;
    }

    try {
        const modifiedBlob = file.slice(startOffset);
        const objectURL = URL.createObjectURL(modifiedBlob);
        const link = document.createElement("a");

        link.href = objectURL;
        link.download = `modified_${file.name}.jpg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            URL.revokeObjectURL(objectURL);
            statusDiv.textContent = 'File processed successfully! Downloading...';
        }, 100);
    } catch (error) {
        console.error("Error during conversion:", error);
        statusDiv.textContent = `Error during conversion. ${error.message}`;
    }
}