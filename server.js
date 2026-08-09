const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2201;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (['exe', 'msi'].includes(ext)) {
    return cb(new Error('Executable files are not allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 },
  fileFilter
});

app.use(express.static(path.join(__dirname, 'main')));

app.post('/api/v1/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }

  const relativePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: relativePath });
});

app.use('/uploads', express.static(uploadDir));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'main', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});