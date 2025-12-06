const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['Mid-Term', 'Final', 'Unit Test', 'Quiz', 'Practical'],
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number // in minutes
    },
    results: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        marksObtained: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number
        },
        grade: {
            type: String
        },
        remarks: {
            type: String
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate percentage and grade before saving
examSchema.pre('save', function (next) {
    this.results.forEach(result => {
        // Calculate percentage
        result.percentage = ((result.marksObtained / this.totalMarks) * 100).toFixed(2);

        // Calculate grade
        const percentage = result.percentage;
        if (percentage >= 90) result.grade = 'A+';
        else if (percentage >= 80) result.grade = 'A';
        else if (percentage >= 70) result.grade = 'B+';
        else if (percentage >= 60) result.grade = 'B';
        else if (percentage >= 50) result.grade = 'C';
        else if (percentage >= 40) result.grade = 'D';
        else result.grade = 'F';
    });
    next();
});

module.exports = mongoose.model('Exam', examSchema);
