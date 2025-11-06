document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS (grab after DOM ready)
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas?.getContext?.("2d");
  const colorPicker = document.getElementById("color");
  const sizePicker = document.getElementById("size");
  const sizeValue = document.getElementById("sizeValue");
  const galleryView = document.getElementById("galleryView");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");
  const btnClear = document.getElementById("clear");
  const btnUndo = document.getElementById("undo");
  const btnRedo = document.getElementById("redo");
  const btnSend = document.getElementById("send");

  // Defensive: make sure required DOM exists
  if (!canvas || !ctx) return console.error("Missing canvas or context (#drawCanvas).");
  if (!colorPicker || !sizePicker || !sizeValue) return console.error("Missing color/size controls.");
  if (!galleryView || !btnPrev || !btnNext) return console.error("Missing gallery elements (#galleryView, #prev, #next).");
  if (!btnClear || !btnUndo || !btnRedo || !btnSend) return console.error("Missing toolbar buttons (clear/undo/redo/send).");

  // STATE
  let drawing = false;
  let strokes = [];
  let undone = [];
  let galleryImages = [];
  let currentIndex = 0;

  // Init white background
  function initCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  initCanvas();

  // ---------- GALLERY ----------
  function showImage(index) {
    galleryView.innerHTML = "";
    if (!galleryImages || galleryImages.length === 0) return;
    // clamp index
    index = ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
    const img = document.createElement("img");
    img.src = galleryImages[index];
    img.style.maxWidth = "180px";
    img.style.maxHeight = "160px";
    img.style.margin = "5px";
    galleryView.appendChild(img);
    currentIndex = index;
  }

  function addGalleryImage(src) {
    if (!src) return;
    galleryImages.push(src);
    saveGallery();
    showImage(galleryImages.length - 1);
  }

  function saveGallery() {
    try {
      localStorage.setItem("galleryImages", JSON.stringify(galleryImages));
    } catch (e) {
      console.error("Failed to save gallery to localStorage:", e);
    }
  }

  function loadGallery() {
    try {
      const saved = JSON.parse(localStorage.getItem("galleryImages")) || [];
      if (Array.isArray(saved)) galleryImages = saved.slice(); // copy
      else galleryImages = [];
    } catch (e) {
      console.error("Failed to load gallery from localStorage:", e);
      galleryImages = [];
    }
    if (galleryImages.length > 0) showImage(0);
  }
  loadGallery();

  btnPrev.addEventListener("click", () => {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showImage(currentIndex);
  });

  btnNext.addEventListener("click", () => {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showImage(currentIndex);
  });

  // ---------- DRAWING ----------
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseout", stop);
  canvas.addEventListener("mousemove", draw);

  function start(e) {
    drawing = true;
    ctx.beginPath();
    // handle both offset and client coordinates fallback
    const x = (e.offsetX !== undefined) ? e.offsetX : e.clientX - canvas.getBoundingClientRect().left;
    const y = (e.offsetY !== undefined) ? e.offsetY : e.clientY - canvas.getBoundingClientRect().top;
    ctx.moveTo(x, y);
  }

  function draw(e) {
    if (!drawing) return;
    const x = (e.offsetX !== undefined) ? e.offsetX : e.clientX - canvas.getBoundingClientRect().left;
    const y = (e.offsetY !== undefined) ? e.offsetY : e.clientY - canvas.getBoundingClientRect().top;
    ctx.lineWidth = sizePicker.value;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stop() {
    if (!drawing) return;
    drawing = false;
    // save snapshot
    strokes.push(canvas.toDataURL());
    undone = [];
  }

  btnClear.addEventListener("click", () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    undone = [];
  });

  btnUndo.addEventListener("click", () => {
    if (strokes.length > 0) {
      undone.push(strokes.pop());
      redraw();
    }
  });

  btnRedo.addEventListener("click", () => {
    if (undone.length > 0) {
      strokes.push(undone.pop());
      redraw();
    }
  });

  function redraw() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (strokes.length === 0) return;
    const img = new Image();
    img.src = strokes[strokes.length - 1];
    img.onload = () => ctx.drawImage(img, 0, 0);
  }

  btnSend.addEventListener("click", () => {
    const blankCanvas = document.createElement("canvas");
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    const blankCtx = blankCanvas.getContext("2d");
    blankCtx.fillStyle = "white";
    blankCtx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);

    const currentData = canvas.toDataURL();
    const blankData = blankCanvas.toDataURL();

    if (currentData === blankData) {
      alert("You haven't drawn anything yet!");
      return;
    }

    addGalleryImage(currentData);

    // reset drawing canvas for next
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    undone = [];
  });

  // Brush size label
  sizePicker.addEventListener("input", () => {
    sizeValue.textContent = sizePicker.value + "px";
  });

  // Expose for debugging if needed
  window._debugGallery = {
    galleryImages,
    showImage,
    addGalleryImage,
    loadGallery,
    saveGallery
  };
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
