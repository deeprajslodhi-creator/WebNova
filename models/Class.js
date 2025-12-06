const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
        unique: true
    },
    section: {
        type: String,
        required: true
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    subjects: [{
        subjectName: String,
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    }],
    academicYear: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        default: 40
    },
    room: {
        type: String
    },
    schedule: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Class', classSchema);
