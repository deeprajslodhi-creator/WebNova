/**
 * File Routes
 * Routes for file operations (upload, list, download, delete)
 */

const express = require('express');
const router = express.Router();
const {
    uploadFile,
    getMyFiles,
    downloadFile,
    deleteFile,
    previewFile
} = require('../controllers/fileController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes are protected
router.use(protect);

// File operations
router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getMyFiles);
router.get('/download/:id', downloadFile);
router.get('/preview/:id', previewFile);
router.delete('/:id', deleteFile);

module.exports = router;
