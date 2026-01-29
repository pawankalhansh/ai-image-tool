// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentImage = null;
let currentFilter = 'original';

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#4CAF50';
  uploadArea.style.background = 'rgba(76, 175, 80, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = '#ddd';
  uploadArea.style.background = 'rgba(0, 0, 0, 0.02)';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#ddd';
  uploadArea.style.background = 'rgba(0, 0, 0, 0.02)';
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
});

fileInput.addEventListener('change', handleFileSelect);

// Filter Buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilter();
  });
});

downloadBtn.addEventListener('click', downloadImage);
resetBtn.addEventListener('click', resetForm);

// Handle File Selection
function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      displayPreview();
      applyFilter();
      preview.style.display = 'block';
      uploadArea.style.display = 'none';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Display Preview
function displayPreview() {
  previewImage.src = currentImage.src;
}

// Apply Filters
function applyFilter() {
  if (!currentImage) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = currentImage.width;
  canvas.height = currentImage.height;

  switch(currentFilter) {
    case 'original':
      ctx.drawImage(currentImage, 0, 0);
      break;
    case 'grayscale':
      ctx.drawImage(currentImage, 0, 0);
      applyGrayscale(ctx, canvas);
      break;
    case 'brightness':
      ctx.drawImage(currentImage, 0, 0);
      applyBrightness(ctx, canvas, 1.3);
      break;
    case 'contrast':
      ctx.drawImage(currentImage, 0, 0);
      applyContrast(ctx, canvas, 1.5);
      break;
    case 'blur':
      ctx.drawImage(currentImage, 0, 0);
      applyBlur(ctx, canvas);
      break;
    case 'watermark-remove':
      ctx.drawImage(currentImage, 0, 0);
      removeWatermark(ctx, canvas);
      break;
    case 'invert':
      ctx.drawImage(currentImage, 0, 0);
      applyInvert(ctx, canvas);
      break;
  }

  previewImage.src = canvas.toDataURL();
  previewImage.filteredData = canvas.toDataURL();
}

// Filter Functions
function applyGrayscale(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyBrightness(ctx, canvas, factor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);
    data[i + 1] = Math.min(255, data[i + 1] * factor);
    data[i + 2] = Math.min(255, data[i + 2] * factor);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyContrast(ctx, canvas, factor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const intercept = 128 * (1 - factor);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * factor + intercept;
    data[i + 1] = data[i + 1] * factor + intercept;
    data[i + 2] = data[i + 2] * factor + intercept;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyBlur(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  const newData = new Uint8ClampedArray(data);
  const radius = 3;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      const idx = (y * width + x) * 4;
      newData[idx] = r / count;
      newData[idx + 1] = g / count;
      newData[idx + 2] = b / count;
    }
  }
  imageData.data.set(newData);
  ctx.putImageData(imageData, 0, 0);
}

function removeWatermark(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Enhance contrast to reduce watermark visibility
  const factor = 1.8;
  const intercept = 128 * (1 - factor);
  for (let i = 0; i < data.length; i += 4) {
    if (i % 4 !== 3) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));
    }
  }
  
  // Apply slight blur to smooth watermark artifacts
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.putImageData(imageData, 0, 0);
}

function applyInvert(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData, 0, 0);
}

// Download Image
function downloadImage() {
  if (!currentImage) return;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = currentImage.width;
  canvas.height = currentImage.height;
  
  ctx.drawImage(previewImage, 0, 0);
  
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `processed-image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset Form
function resetForm() {
  currentImage = null;
  currentFilter = 'original';
  fileInput.value = '';
  preview.style.display = 'none';
  uploadArea.style.display = 'flex';
  filterButtons.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-filter="original"]').classList.add('active');
}
