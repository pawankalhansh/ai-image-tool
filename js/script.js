// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#10b981';
    uploadArea.style.background = 'rgba(16, 185, 129, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#06b6d4';
    uploadArea.style.background = 'rgba(6, 182, 212, 0.05)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#06b6d4';
    uploadArea.style.background = 'rgba(6, 182, 212, 0.05)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
});

fileInput.addEventListener('change', handleFileSelect);
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
            previewImage.src = img.src;
            preview.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Download Image
function downloadImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `processed-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    };
    img.src = previewImage.src;
}

// Reset Form
function resetForm() {
    fileInput.value = '';
    preview.style.display = 'none';
    uploadArea.style.display = 'block';
    previewImage.src = '';
}

console.log('AI Image Tool - Ready to process images!');
