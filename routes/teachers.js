const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/teachers
 * @desc    Get all teachers
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('userId', '-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: teachers.length,
            teachers
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers'
        });
    }
});

/**
 * @route   GET /api/teachers/:id
 * @desc    Get teacher by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('userId', '-password');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            teacher
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher'
        });
    }
});

/**
 * @route   POST /api/teachers
 * @desc    Add new teacher
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            fullName, email, username, password, phone, address,
            employeeId, qualification, experience, subjects,
            specialization, salary, dateOfBirth, gender,
            bloodGroup, emergencyContact
        } = req.body;

        // Create user account for teacher
        const user = new User({
            username,
            email,
            password,
            role: 'teacher',
            fullName,
            phone,
            address
        });

        await user.save();

        // Create teacher record
        const teacher = new Teacher({
            userId: user._id,
            employeeId,
            joiningDate: new Date(),
            qualification,
            experience,
            subjects: subjects || [],
            specialization,
            salary,
            dateOfBirth,
            gender,
            bloodGroup,
            emergencyContact
        });

        await teacher.save();

        const populatedTeacher = await Teacher.findById(teacher._id)
            .populate('userId', '-password');

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            teacher: populatedTeacher
        });
    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding teacher',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/teachers/:id
 * @desc    Update teacher
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Update teacher fields
        const updateFields = [
            'employeeId', 'qualification', 'experience', 'subjects',
            'specialization', 'salary', 'dateOfBirth', 'gender',
            'bloodGroup', 'emergencyContact', 'status'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                teacher[field] = req.body[field];
            }
        });

        await teacher.save();

        // Update user info if provided
        if (req.body.fullName || req.body.email || req.body.phone || req.body.address) {
            const user = await User.findById(teacher.userId);
            if (user) {
                if (req.body.fullName) user.fullName = req.body.fullName;
                if (req.body.email) user.email = req.body.email;
                if (req.body.phone) user.phone = req.body.phone;
                if (req.body.address) user.address = req.body.address;
                await user.save();
            }
        }

        const updatedTeacher = await Teacher.findById(teacher._id)
            .populate('userId', '-password');

        res.json({
            success: true,
            message: 'Teacher updated successfully',
            teacher: updatedTeacher
        });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating teacher'
        });
    }
});

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Delete teacher
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Delete associated user account
        await User.findByIdAndDelete(teacher.userId);

        // Delete teacher record
        await Teacher.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting teacher'
        });
    }
});

/**
 * @route   PUT /api/teachers/:id/subjects
 * @desc    Assign subjects to teacher
 * @access  Private/Admin
 */
router.put('/:id/subjects', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { subjects } = req.body;

        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        teacher.subjects = subjects;
        await teacher.save();

        const updatedTeacher = await Teacher.findById(teacher._id)
            .populate('userId', '-password');

        res.json({
            success: true,
            message: 'Subjects assigned successfully',
            teacher: updatedTeacher
        });
    } catch (error) {
        console.error('Assign subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning subjects'
        });
    }
});

module.exports = router;
