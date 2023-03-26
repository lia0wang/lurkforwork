//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dropZone.js:                                                                                             //
//      Contains image drop zone related UI behaviour, highlight zone while user is dragging an image       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const dropZone = document.getElementById("drop-zone");

//////////////////////////////////////////////////////// DROP ZONE MAIN //////////////////////////////////////////////////////////

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    dropZone.classList.add("drop-zone--over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drop-zone--over");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove("drop-zone--over");

    const files = event.dataTransfer.files;
    if (files.length === 1 && files[0].type.startsWith("image/")) {
        document.getElementById("job-image").files = files;
    }
});

dropZone.addEventListener("click", () => {
    document.getElementById("job-image").click();
});
