const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Get counts
        const totalStudents = await Student.countDocuments({ status: 'Active' });
        const totalTeachers = await Teacher.countDocuments({ status: 'Active' });
        const totalClasses = await Class.countDocuments({ isActive: true });

        // Get today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = await Attendance.find({
            date: today
        });

        let presentToday = 0;
        let absentToday = 0;

        todayAttendance.forEach(att => {
            att.records.forEach(record => {
                if (record.status === 'Present') presentToday++;
                else if (record.status === 'Absent') absentToday++;
            });
        });

        const attendancePercentage = totalStudents > 0
            ? ((presentToday / totalStudents) * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            stats: {
                totalStudents,
                totalTeachers,
                totalClasses,
                todayAttendance: {
                    present: presentToday,
                    absent: absentToday,
                    percentage: attendancePercentage
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

/**
 * @route   GET /api/dashboard/recent-students
 * @desc    Get recently added students
 * @access  Private
 */
router.get('/recent-students', authMiddleware, async (req, res) => {
    try {
        const recentStudents = await Student.find()
            .populate('userId', '-password')
            .populate('class')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            students: recentStudents
        });
    } catch (error) {
        console.error('Get recent students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent students'
        });
    }
});

/**
 * @route   GET /api/dashboard/attendance-chart
 * @desc    Get attendance data for chart (last 7 days)
 * @access  Private
 */
router.get('/attendance-chart', authMiddleware, async (req, res) => {
    try {
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const attendance = await Attendance.find({ date });

            let present = 0;
            let absent = 0;

            attendance.forEach(att => {
                att.records.forEach(record => {
                    if (record.status === 'Present') present++;
                    else if (record.status === 'Absent') absent++;
                });
            });

            chartData.push({
                date: date.toISOString().split('T')[0],
                present,
                absent
            });
        }

        res.json({
            success: true,
            chartData
        });
    } catch (error) {
        console.error('Get attendance chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance chart data'
        });
    }
});

/**
 * @route   GET /api/dashboard/class-distribution
 * @desc    Get student distribution by class
 * @access  Private
 */
router.get('/class-distribution', authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true })
            .populate('students');

        const distribution = classes.map(cls => ({
            className: `${cls.className} ${cls.section}`,
            studentCount: cls.students.length,
            capacity: cls.capacity
        }));

        res.json({
            success: true,
            distribution
        });
    } catch (error) {
        console.error('Get class distribution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class distribution'
        });
    }
});

module.exports = router;
