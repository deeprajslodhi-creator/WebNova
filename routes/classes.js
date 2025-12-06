const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Student = require('../models/Student');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/classes
 * @desc    Get all classes
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('classTeacher')
            .populate('students')
            .populate('subjects.teacher')
            .sort({ className: 1 });

        res.json({
            success: true,
            count: classes.length,
            classes
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching classes'
        });
    }
});

/**
 * @route   GET /api/classes/:id
 * @desc    Get class by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('classTeacher')
            .populate({
                path: 'students',
                populate: { path: 'userId', select: '-password' }
            })
            .populate('subjects.teacher');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.json({
            success: true,
            class: classData
        });
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class'
        });
    }
});

/**
 * @route   POST /api/classes
 * @desc    Create new class
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            className, section, classTeacher, academicYear,
            capacity, room, schedule, subjects
        } = req.body;

        const newClass = new Class({
            className,
            section,
            classTeacher,
            academicYear,
            capacity,
            room,
            schedule,
            subjects: subjects || []
        });

        await newClass.save();

        const populatedClass = await Class.findById(newClass._id)
            .populate('classTeacher')
            .populate('subjects.teacher');

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            class: populatedClass
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating class',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/classes/:id
 * @desc    Update class
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        const updateFields = [
            'className', 'section', 'classTeacher', 'academicYear',
            'capacity', 'room', 'schedule', 'subjects', 'isActive'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                classData[field] = req.body[field];
            }
        });

        await classData.save();

        const updatedClass = await Class.findById(classData._id)
            .populate('classTeacher')
            .populate('subjects.teacher');

        res.json({
            success: true,
            message: 'Class updated successfully',
            class: updatedClass
        });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating class'
        });
    }
});

/**
 * @route   DELETE /api/classes/:id
 * @desc    Delete class
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        await Class.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Class deleted successfully'
        });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting class'
        });
    }
});

/**
 * @route   POST /api/classes/:id/students
 * @desc    Add students to class
 * @access  Private/Admin
 */
router.post('/:id/students', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { studentIds } = req.body;

        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Add students to class
        studentIds.forEach(studentId => {
            if (!classData.students.includes(studentId)) {
                classData.students.push(studentId);
            }
        });

        await classData.save();

        // Update student records
        await Student.updateMany(
            { _id: { $in: studentIds } },
            { class: classData._id }
        );

        const updatedClass = await Class.findById(classData._id)
            .populate('students');

        res.json({
            success: true,
            message: 'Students added to class successfully',
            class: updatedClass
        });
    } catch (error) {
        console.error('Add students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding students to class'
        });
    }
});

/**
 * @route   DELETE /api/classes/:id/students/:studentId
 * @desc    Remove student from class
 * @access  Private/Admin
 */
router.delete('/:id/students/:studentId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        classData.students = classData.students.filter(
            student => student.toString() !== req.params.studentId
        );

        await classData.save();

        // Update student record
        await Student.findByIdAndUpdate(
            req.params.studentId,
            { $unset: { class: 1 } }
        );

        res.json({
            success: true,
            message: 'Student removed from class successfully'
        });
    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing student from class'
        });
    }
});

/**
 * @route   POST /api/classes/promote
 * @desc    Promote students to next class
 * @access  Private/Admin
 */
router.post('/promote', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { fromClassId, toClassId, studentIds } = req.body;

        // Remove students from old class
        await Class.findByIdAndUpdate(
            fromClassId,
            { $pull: { students: { $in: studentIds } } }
        );

        // Add students to new class
        await Class.findByIdAndUpdate(
            toClassId,
            { $push: { students: { $each: studentIds } } }
        );

        // Update student records
        await Student.updateMany(
            { _id: { $in: studentIds } },
            { class: toClassId }
        );

        res.json({
            success: true,
            message: 'Students promoted successfully'
        });
    } catch (error) {
        console.error('Promote students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error promoting students'
        });
    }
});

module.exports = router;
