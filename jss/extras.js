const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const colorPicker = document.getElementById("color");
const sizePicker = document.getElementById("size");
let drawing = false;
let strokes = [];
let undone = [];

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

document.getElementById("clear").onclick = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    undone = [];
};

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (strokes.length === 0) return;
  img.src = strokes[strokes.length - 1];
  img.onload = () => ctx.drawImage(img, 0, 0);
}

document.getElementById("send").onclick = () => {
  const img = document.createElement("img");
  img.src = canvas.toDataURL();
  
  document.getElementById("galleryView").appendChild(img);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes = [];
  undone = [];
};

const sizeSlider = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');

sizeSlider.addEventListener('input', () => {
  sizeValue.textContent = sizeSlider.value + 'px';
});

const closeButtons = document.querySelectorAll(".close-btn");

closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        clickSound.currentTime = 0; 
        clickSound.play();
    });
});
