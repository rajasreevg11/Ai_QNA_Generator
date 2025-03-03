// document.getElementById("jdForm").addEventListener("submit", function (event) {
//     let jdText = document.getElementById("jdTextArea").value.trim();
//     let uploadStatus = document.getElementById("uploadStatus").value;

//     // if (uploadStatus !== "true") {
//     //     alert("Please upload the resume first.");
//     //     event.preventDefault();  
//     //     return;
//     // }
//     if (!jdText) {
//         alert("Please enter the job description.");
//         event.preventDefault();  
//         return;
//     }
//     alert("JD processing....");
//     fetch("/generate", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//         },
//         body: new URLSearchParams({
//             jd_text_area: jdText,
//             upload_status: uploadStatus
//         })
//     })
//     .then(response => response.text()) 
//     .then(data => {
//         console.log("Server response:", data);
//         document.body.innerHTML = data; 
//     })
//     .catch(error => console.error("Error:", error));
// });

document.addEventListener("DOMContentLoaded", function () {
    let dropArea = document.getElementById("drop-area");
    let dropText = document.getElementById("drop-text");
    let fileInput = document.getElementById("fileInput");
    let uploadBtn = document.getElementById("uploadBtn");
    let uploadText = document.getElementById("uploadText");
    let uploadStatus = document.getElementById("upload-status");
    let selectedFile = null;  // Store selected file
    let loadingGif = document.getElementById("loadingGif");
    let submitBtn = document.getElementById("submitBtn");
    let loadingSubmitGif = document.getElementById("loadingSubmitGif");
    let clearJDBtn = document.getElementById("clearJDBtn");
    let jdTextArea = document.getElementById("jdTextArea");
    let uploadSuccess = document.getElementById("upload-success");
    

    // Click drop area to open file picker
    dropArea.addEventListener("click", () => fileInput.click());

    // Drag-and-drop functionality (Select file but don't upload)
    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.classList.add("highlight");
    });

    dropArea.addEventListener("dragleave", () => dropArea.classList.remove("highlight"));

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.classList.remove("highlight");

        selectedFile = event.dataTransfer.files[0];
        updateUploadStatus();
    });

    // File selection via file picker
    fileInput.addEventListener("change", () => {
        selectedFile = fileInput.files[0];
        updateUploadStatus();
    });

    // Upload file only when clicking the new Upload button
    uploadBtn.addEventListener("click", () => {
        if (selectedFile) {
            uploadFile(selectedFile);
        } else {
            alert("Please select a file before uploading.");
        }
    });

    function uploadFile(file) {
        let formData = new FormData();
        formData.append("resume", file);
        uploadBtn.disabled = true;
        uploadText.textContent = "Uploading...";
        uploadStatus.innerText = "";
        loadingGif.style.display = "inline-block"; // Show GIF
        fetch("/upload", {
            method: "POST",
            body: formData
        })
        
        .then(response => response.json()) 
        .then(data => {
            console.log("Response from server:", data);
            let message = data.message || "Upload Failed!";
        uploadStatus.innerText = message;

        // Update input field based on response
        if (message !== "Upload Failed!") {
            uploadSuccess.value = "true";
        } else {
            uploadSuccess.value = "false";
        }
        })
        
        .catch(error => {
            console.error("Upload failed:", error);
            uploadStatus.innerText = "Upload Failed!";
        })
        .finally(() => {
            // Re-enable button and hide loading GIF
            uploadBtn.disabled = false;
            uploadText.textContent = "Upload";
            loadingGif.style.display = "none"; // Hide GIF
        });

    }

    function updateUploadStatus() {
        if (selectedFile) {
            dropText.innerText = `Selected File: ${selectedFile.name}`;
            dropArea.classList.add("file-selected");
        } else {
            dropText.innerText = "Drag & Drop your resume here or click to select";
            dropArea.classList.remove("file-selected");
        }
        uploadSuccess.value = "false";
    }

    submitBtn.addEventListener("click", () => {
        let jdText = jdTextArea.value.trim();
        if (uploadSuccess.value !== "true") {
            alert("Please upload the resume first.");  
            return;
        }
        if (!jdText) {
            alert("Please enter the job description.");
            return;
        }
        let formData = new FormData();
        formData.append("jd_text_area", jdText);
        // alert("JD processing....123");
        uploadBtn.disabled = true;
        submitBtn.disabled = true;
        loadingSubmitGif.style.display = "inline-block"; // Show GIF
        fetch("/generate", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || "Unknown error") });
            }
            return response.blob();
        })
        .then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = "generated_doc.docx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error generating document: " + error.message);
        })
        .finally(() => {
            uploadBtn.disabled = false;
            submitBtn.disabled = false;
            loadingSubmitGif.style.display = "none";
            uploadSuccess.value = "false"; // Hide GIF
            uploadStatus.innerText = "";
        });

    });

    clearJDBtn.addEventListener("click", () => {
        jdTextArea.value = "";
    });
});