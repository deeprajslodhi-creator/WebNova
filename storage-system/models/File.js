/**
 * File Model
 * Schema for uploaded files metadata
 */

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true,
        unique: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    downloads: {
        type: Number,
        default: 0
    }
});

// Index for faster queries
fileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
fileSchema.index({ filename: 1 });

module.exports = mongoose.model('File', fileSchema);
