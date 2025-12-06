const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number, // in years
        default: 0
    },
    subjects: [{
        type: String
    }],
    specialization: {
        type: String
    },
    salary: {
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
    emergencyContact: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Leave'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate teacher ID before saving
teacherSchema.pre('save', async function (next) {
    if (!this.teacherId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Teacher').countDocuments();
        this.teacherId = `TCH${year}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
