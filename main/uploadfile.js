const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const linkContainer = document.getElementById('linkContainer');
const fileLink = document.getElementById('fileLink');
const copyBtn = document.getElementById('copyBtn');

uploadBox.addEventListener('click', () => fileInput.click());

uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.style.background = '#e8dfff';
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.background = '#fdfde7';
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.style.background = '#fdfde7';
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  if (!files.length) return;
  [...files].forEach(uploadFile);
}

function uploadFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  progressContainer.style.display = 'block';
  linkContainer.style.display = 'none';
  progressText.textContent = 'Uploading...';
  progressBar.style.width = '0%';

  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/v1/upload');

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percent + '%';
    }
  });

  xhr.onload = () => {
    if (xhr.status === 200) {
      let response;

      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        progressText.textContent = 'Server Error.';
        return;
      }

      const fullUrl = window.location.origin + response.url;

      fileLink.href = fullUrl;
      fileLink.textContent = fullUrl;

      linkContainer.style.display = 'block';
      progressText.textContent = 'Successfully uploaded.';
    } else {
      progressText.textContent = 'Upload failed.';
    }
  };

  xhr.onerror = () => {
    progressText.textContent = 'Upload failed.';
  };

  xhr.send(formData);
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(fileLink.href);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => copyBtn.textContent = 'Copy Link', 1500);
});
