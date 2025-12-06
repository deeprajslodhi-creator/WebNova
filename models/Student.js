const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admissionNumber: {
        type: String,
        required: true,
        unique: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    rollNumber: {
        type: Number
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    bloodGroup: {
        type: String
    },
    parentName: {
        type: String,
        required: true
    },
    parentPhone: {
        type: String,
        required: true
    },
    parentEmail: {
        type: String
    },
    emergencyContact: {
        type: String
    },
    previousSchool: {
        type: String
    },
    medicalInfo: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Graduated', 'Transferred'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate student ID before saving
studentSchema.pre('save', async function (next) {
    if (!this.studentId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Student').countDocuments();
        this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Student', studentSchema);
