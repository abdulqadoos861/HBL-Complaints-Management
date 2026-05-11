const path = require('path')
const fs = require('fs')

// multer storage config lives here so it can be reused
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'complaints')
ensureDir(UPLOAD_DIR)

exports.complaintAttachmentsUploadMiddleware = (multer) => {
  const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB per file (basic)
    }
  })

  return upload
}


