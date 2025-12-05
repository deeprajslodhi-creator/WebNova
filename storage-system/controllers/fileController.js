/**
 * File Controller
 * Handles file upload, list, download, delete operations
 */

const File = require('../models/File');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Check user storage limit
        const user = await User.findById(req.user.id);
        if (user.storageUsed + req.file.size > user.storageLimit) {
            // Delete uploaded file
            await fs.unlink(req.file.path);

            return res.status(400).json({
                success: false,
                message: 'Storage limit exceeded'
            });
        }

        // Create file record
        const file = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user.id
        });

        // Update user storage
        user.storageUsed += req.file.size;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                id: file._id,
                originalName: file.originalName,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                uploadedAt: file.uploadedAt
            }
        });
    } catch (error) {
        // Clean up file if database operation fails
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error(err));
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};

// @desc    Get all files for current user
// @route   GET /api/files
// @access  Private
exports.getMyFiles = async (req, res) => {
    try {
        const { search, sort } = req.query;

        let query = { uploadedBy: req.user.id };

        // Search functionality
        if (search) {
            query.originalName = { $regex: search, $options: 'i' };
        }

        // Sort options
        let sortOption = { uploadedAt: -1 }; // Default: newest first
        if (sort === 'name') sortOption = { originalName: 1 };
        if (sort === 'size') sortOption = { size: -1 };
        if (sort === 'oldest') sortOption = { uploadedAt: 1 };

        const files = await File.find(query).sort(sortOption);

        res.status(200).json({
            success: true,
            count: files.length,
            files: files.map(file => ({
                id: file._id,
                originalName: file.originalName,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                uploadedAt: file.uploadedAt,
                downloads: file.downloads
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching files',
            error: error.message
        });
    }
};

// @desc    Download file
// @route   GET /api/files/download/:id
// @access  Private
exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check if user owns the file or is admin
        if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this file'
            });
        }

        // Increment download count
        file.downloads += 1;
        await file.save();

        // Send file
        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check if user owns the file or is admin
        if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this file'
            });
        }

        // Delete file from filesystem
        try {
            await fs.unlink(file.path);
        } catch (err) {
            console.error('Error deleting file from filesystem:', err);
        }

        // Update user storage
        const user = await User.findById(file.uploadedBy);
        if (user) {
            user.storageUsed = Math.max(0, user.storageUsed - file.size);
            await user.save();
        }

        // Delete file record
        await file.deleteOne();

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
};

// @desc    Get file preview (for images)
// @route   GET /api/files/preview/:id
// @access  Private
exports.previewFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check if user owns the file or is admin
        if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to preview this file'
            });
        }

        // Check if file is an image
        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'File is not an image'
            });
        }

        // Send file with correct content type
        res.setHeader('Content-Type', file.mimetype);
        res.sendFile(path.resolve(file.path));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error previewing file',
            error: error.message
        });
    }
};
