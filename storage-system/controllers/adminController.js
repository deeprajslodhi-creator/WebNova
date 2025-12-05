/**
 * Admin Controller
 * Handles admin-specific operations
 */

const File = require('../models/File');
const User = require('../models/User');
const fs = require('fs').promises;

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFiles = await File.countDocuments();

        // Calculate total storage used
        const storageAgg = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalStorage: { $sum: '$storageUsed' }
                }
            }
        ]);

        const totalStorage = storageAgg.length > 0 ? storageAgg[0].totalStorage : 0;

        // Get recent uploads
        const recentUploads = await File.find()
            .sort({ uploadedAt: -1 })
            .limit(10)
            .populate('uploadedBy', 'email');

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalFiles,
                totalStorage,
                totalStorageGB: (totalStorage / (1024 * 1024 * 1024)).toFixed(2)
            },
            recentUploads: recentUploads.map(file => ({
                id: file._id,
                originalName: file.originalName,
                size: file.size,
                uploadedBy: file.uploadedBy.email,
                uploadedAt: file.uploadedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get all files (admin)
// @route   GET /api/admin/files
// @access  Private/Admin
exports.getAllFiles = async (req, res) => {
    try {
        const { search, sort, user } = req.query;

        let query = {};

        // Filter by user
        if (user) {
            query.uploadedBy = user;
        }

        // Search functionality
        if (search) {
            query.originalName = { $regex: search, $options: 'i' };
        }

        // Sort options
        let sortOption = { uploadedAt: -1 };
        if (sort === 'name') sortOption = { originalName: 1 };
        if (sort === 'size') sortOption = { size: -1 };
        if (sort === 'oldest') sortOption = { uploadedAt: 1 };

        const files = await File.find(query)
            .sort(sortOption)
            .populate('uploadedBy', 'email');

        res.status(200).json({
            success: true,
            count: files.length,
            files: files.map(file => ({
                id: file._id,
                originalName: file.originalName,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                uploadedBy: file.uploadedBy.email,
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

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                email: user.email,
                role: user.role,
                storageUsed: user.storageUsed,
                storageLimit: user.storageLimit,
                storageUsedMB: (user.storageUsed / (1024 * 1024)).toFixed(2),
                storageLimitMB: (user.storageLimit / (1024 * 1024)).toFixed(2),
                createdAt: user.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Delete any file (admin)
// @route   DELETE /api/admin/files/:id
// @access  Private/Admin
exports.deleteAnyFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
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
