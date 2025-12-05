/**
 * File Upload Middleware
 * Handles file uploads with validation using Multer
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: uuid-timestamp-originalname
        const uniqueSuffix = uuidv4();
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);

        // Sanitize filename - remove special characters
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

        cb(null, `${uniqueSuffix}-${timestamp}-${safeName}${ext}`);
    }
});

// File filter - validate file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'video/mp4',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: images, PDF, ZIP, MP4, TXT`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520 // 20MB default
    },
    fileFilter: fileFilter
});

module.exports = upload;
