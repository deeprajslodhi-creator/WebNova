const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { authMiddleware, teacherMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/exams
 * @desc    Get all exams
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('class')
            .populate('results.student')
            .populate('createdBy', '-password')
            .sort({ examDate: -1 });

        res.json({
            success: true,
            count: exams.length,
            exams
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exams'
        });
    }
});

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('class')
            .populate({
                path: 'results.student',
                populate: { path: 'userId', select: '-password' }
            })
            .populate('createdBy', '-password');

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        res.json({
            success: true,
            exam
        });
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exam'
        });
    }
});

/**
 * @route   POST /api/exams
 * @desc    Create new exam
 * @access  Private/Teacher
 */
router.post('/', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const {
            examName, examType, classId, subject, totalMarks,
            passingMarks, examDate, duration
        } = req.body;

        const exam = new Exam({
            examName,
            examType,
            class: classId,
            subject,
            totalMarks,
            passingMarks,
            examDate,
            duration,
            createdBy: req.user.id
        });

        await exam.save();

        const populatedExam = await Exam.findById(exam._id)
            .populate('class')
            .populate('createdBy', '-password');

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            exam: populatedExam
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating exam',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/exams/:id
 * @desc    Update exam
 * @access  Private/Teacher
 */
router.put('/:id', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const updateFields = [
            'examName', 'examType', 'subject', 'totalMarks',
            'passingMarks', 'examDate', 'duration'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                exam[field] = req.body[field];
            }
        });

        await exam.save();

        const updatedExam = await Exam.findById(exam._id)
            .populate('class')
            .populate('createdBy', '-password');

        res.json({
            success: true,
            message: 'Exam updated successfully',
            exam: updatedExam
        });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating exam'
        });
    }
});

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete exam
 * @access  Private/Teacher
 */
router.delete('/:id', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        await Exam.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting exam'
        });
    }
});

/**
 * @route   POST /api/exams/:id/results
 * @desc    Add/Update exam results
 * @access  Private/Teacher
 */
router.post('/:id/results', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const { results } = req.body; // Array of { student, marksObtained, remarks }

        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Update or add results
        results.forEach(newResult => {
            const existingIndex = exam.results.findIndex(
                r => r.student.toString() === newResult.student
            );

            if (existingIndex !== -1) {
                exam.results[existingIndex].marksObtained = newResult.marksObtained;
                exam.results[existingIndex].remarks = newResult.remarks;
            } else {
                exam.results.push(newResult);
            }
        });

        await exam.save();

        const updatedExam = await Exam.findById(exam._id)
            .populate('class')
            .populate('results.student');

        res.json({
            success: true,
            message: 'Results added successfully',
            exam: updatedExam
        });
    } catch (error) {
        console.error('Add results error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding results'
        });
    }
});

/**
 * @route   GET /api/exams/student/:studentId
 * @desc    Get exams by student
 * @access  Private
 */
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const exams = await Exam.find({
            'results.student': req.params.studentId
        })
            .populate('class')
            .sort({ examDate: -1 });

        // Extract only this student's results
        const studentExams = exams.map(exam => {
            const studentResult = exam.results.find(
                r => r.student.toString() === req.params.studentId
            );
            return {
                _id: exam._id,
                examName: exam.examName,
                examType: exam.examType,
                subject: exam.subject,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                examDate: exam.examDate,
                marksObtained: studentResult?.marksObtained,
                percentage: studentResult?.percentage,
                grade: studentResult?.grade,
                remarks: studentResult?.remarks
            };
        });

        res.json({
            success: true,
            count: studentExams.length,
            exams: studentExams
        });
    } catch (error) {
        console.error('Get student exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student exams'
        });
    }
});

/**
 * @route   GET /api/exams/:id/export
 * @desc    Export exam results as JSON
 * @access  Private
 */
router.get('/:id/export', authMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('class')
            .populate({
                path: 'results.student',
                populate: { path: 'userId', select: 'fullName email' }
            });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Format data for export
        const exportData = {
            examInfo: {
                examName: exam.examName,
                examType: exam.examType,
                subject: exam.subject,
                class: exam.class.className,
                section: exam.class.section,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                examDate: exam.examDate
            },
            results: exam.results.map(result => ({
                studentId: result.student.studentId,
                studentName: result.student.userId.fullName,
                marksObtained: result.marksObtained,
                percentage: result.percentage,
                grade: result.grade,
                status: result.marksObtained >= exam.passingMarks ? 'Pass' : 'Fail',
                remarks: result.remarks
            }))
        };

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.error('Export results error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting results'
        });
    }
});

module.exports = router;
