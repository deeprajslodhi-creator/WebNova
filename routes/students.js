const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/students
 * @desc    Get all students
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find()
            .populate('userId', '-password')
            .populate('class')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('userId', '-password')
            .populate('class');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
});

/**
 * @route   POST /api/students
 * @desc    Add new student
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            fullName, email, username, password, phone, address,
            admissionNumber, dateOfBirth, gender, bloodGroup,
            parentName, parentPhone, parentEmail, emergencyContact,
            previousSchool, medicalInfo, classId
        } = req.body;

        // Create user account for student
        const user = new User({
            username,
            email,
            password,
            role: 'student',
            fullName,
            phone,
            address
        });

        await user.save();

        // Create student record
        const student = new Student({
            userId: user._id,
            admissionNumber,
            admissionDate: new Date(),
            class: classId,
            dateOfBirth,
            gender,
            bloodGroup,
            parentName,
            parentPhone,
            parentEmail,
            emergencyContact,
            previousSchool,
            medicalInfo
        });

        await student.save();

        const populatedStudent = await Student.findById(student._id)
            .populate('userId', '-password')
            .populate('class');

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            student: populatedStudent
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding student',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update student fields
        const updateFields = [
            'admissionNumber', 'class', 'rollNumber', 'dateOfBirth',
            'gender', 'bloodGroup', 'parentName', 'parentPhone',
            'parentEmail', 'emergencyContact', 'previousSchool',
            'medicalInfo', 'status'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                student[field] = req.body[field];
            }
        });

        await student.save();

        // Update user info if provided
        if (req.body.fullName || req.body.email || req.body.phone || req.body.address) {
            const user = await User.findById(student.userId);
            if (user) {
                if (req.body.fullName) user.fullName = req.body.fullName;
                if (req.body.email) user.email = req.body.email;
                if (req.body.phone) user.phone = req.body.phone;
                if (req.body.address) user.address = req.body.address;
                await user.save();
            }
        }

        const updatedStudent = await Student.findById(student._id)
            .populate('userId', '-password')
            .populate('class');

        res.json({
            success: true,
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student'
        });
    }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated user account
        await User.findByIdAndDelete(student.userId);

        // Delete student record
        await Student.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
});

module.exports = router;
