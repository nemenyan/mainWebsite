const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("color");
const sizePicker = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");
const galleryView = document.getElementById("galleryView");

let drawing = false;
let strokes = [];
let undone = [];

// Initialize canvas with white background
function initCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
initCanvas();

// Load gallery from localStorage
function loadGallery() {
  const saved = JSON.parse(localStorage.getItem("galleryImages")) || [];
  saved.forEach(src => addGalleryImage(src));
}
loadGallery();

// Drawing handlers
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseout", stop);
canvas.addEventListener("mousemove", draw);

function start(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}
function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = sizePicker.value;
  ctx.strokeStyle = colorPicker.value;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}
function stop() {
  if (drawing) {
    drawing = false;
    strokes.push(canvas.toDataURL());
    undone = [];
  }
}

// Clear canvas
document.getElementById("clear").onclick = () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  strokes = [];
  undone = [];
};

// Undo / Redo
document.getElementById("undo").onclick = () => {
  if (strokes.length > 0) {
    undone.push(strokes.pop());
    redraw();
  }
};
document.getElementById("redo").onclick = () => {
  if (undone.length > 0) {
    strokes.push(undone.pop());
    redraw();
  }
};
function redraw() {
  const img = new Image();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (strokes.length === 0) return;
  img.src = strokes[strokes.length - 1];
  img.onload = () => ctx.drawImage(img, 0, 0);
}

document.getElementById("send").onclick = () => {
  // Create a blank version to compare
  const blankCanvas = document.createElement("canvas");
  blankCanvas.width = canvas.width;
  blankCanvas.height = canvas.height;
  const blankCtx = blankCanvas.getContext("2d");
  blankCtx.fillStyle = "white";
  blankCtx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);

  const currentData = canvas.toDataURL();
  const blankData = blankCanvas.toDataURL();

  // ✅ Skip saving if nothing drawn
  if (currentData === blankData) {
    alert("You haven't drawn anything yet!");
    return;
  }

  // Otherwise, save normally
  addGalleryImage(currentData);

  const saved = JSON.parse(localStorage.getItem("galleryImages")) || [];
  saved.push(currentData);
  localStorage.setItem("galleryImages", JSON.stringify(saved));

  // Clear canvas for next drawing
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  strokes = [];
  undone = [];
};

// Helper: add an image to galleryView
function addGalleryImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "100px";
  img.style.maxHeight = "100px";
  img.style.border = "1px solid #aaa";
  img.style.borderRadius = "4px";
  img.style.margin = "5px";
  galleryView.appendChild(img);
}

// Brush size label
sizePicker.addEventListener("input", () => {
  sizeValue.textContent = sizePicker.value + "px";
});
const closeButtons = document.querySelectorAll(".close-btn");

closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        clickSound.currentTime = 0; 
        clickSound.play();
    });
});

document.querySelectorAll(".close-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const windowBody = btn.closest(".window").querySelector(".window-body");
    windowBody.classList.toggle("collapsed");
  });
});
