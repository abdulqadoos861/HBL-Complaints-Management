const path = require('path')
const fs = require('fs')

// multer storage config lives here so it can be reused
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'complaints')
ensureDir(UPLOAD_DIR)

exports.complaintAttachmentsUploadMiddleware = (multer) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // Use original filename with timestamp to avoid name collisions
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB per file
    }
  });

  return upload;
}


