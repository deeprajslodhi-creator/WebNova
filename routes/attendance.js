const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const { authMiddleware, teacherMiddleware } = require('../middleware/auth');

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance for a class
 * @access  Private/Teacher
 */
router.post('/', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const { classId, date, records } = req.body;

        // Check if attendance already exists for this class and date
        const existingAttendance = await Attendance.findOne({
            class: classId,
            date: new Date(date).setHours(0, 0, 0, 0)
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this date'
            });
        }

        const attendance = new Attendance({
            class: classId,
            date: new Date(date),
            records,
            markedBy: req.user.id
        });

        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('class')
            .populate('records.student')
            .populate('markedBy', '-password');

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            attendance: populatedAttendance
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance
 * @access  Private/Teacher
 */
router.put('/:id', authMiddleware, teacherMiddleware, async (req, res) => {
    try {
        const { records } = req.body;

        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }

        attendance.records = records;
        await attendance.save();

        const updatedAttendance = await Attendance.findById(attendance._id)
            .populate('class')
            .populate('records.student')
            .populate('markedBy', '-password');

        res.json({
            success: true,
            message: 'Attendance updated successfully',
            attendance: updatedAttendance
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating attendance'
        });
    }
});

/**
 * @route   GET /api/attendance/class/:classId
 * @desc    Get attendance by class
 * @access  Private
 */
router.get('/class/:classId', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = { class: req.params.classId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('records.student')
            .populate('markedBy', '-password')
            .sort({ date: -1 });

        res.json({
            success: true,
            count: attendance.length,
            attendance
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
});

/**
 * @route   GET /api/attendance/student/:studentId
 * @desc    Get attendance by student
 * @access  Private
 */
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = { 'records.student': req.params.studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('class')
            .sort({ date: -1 });

        // Extract only this student's records
        const studentAttendance = attendance.map(att => {
            const studentRecord = att.records.find(
                r => r.student.toString() === req.params.studentId
            );
            return {
                date: att.date,
                class: att.class,
                status: studentRecord?.status,
                remarks: studentRecord?.remarks
            };
        });

        res.json({
            success: true,
            count: studentAttendance.length,
            attendance: studentAttendance
        });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student attendance'
        });
    }
});

/**
 * @route   GET /api/attendance/summary/:classId
 * @desc    Get attendance summary for a class
 * @access  Private
 */
router.get('/summary/:classId', authMiddleware, async (req, res) => {
    try {
        const { period } = req.query; // daily, weekly, monthly

        let startDate = new Date();

        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const attendance = await Attendance.find({
            class: req.params.classId,
            date: { $gte: startDate }
        }).populate('records.student');

        // Calculate summary
        const summary = {
            totalDays: attendance.length,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendancePercentage: 0
        };

        let totalRecords = 0;

        attendance.forEach(att => {
            att.records.forEach(record => {
                totalRecords++;
                if (record.status === 'Present') summary.present++;
                else if (record.status === 'Absent') summary.absent++;
                else if (record.status === 'Late') summary.late++;
                else if (record.status === 'Excused') summary.excused++;
            });
        });

        if (totalRecords > 0) {
            summary.attendancePercentage = ((summary.present / totalRecords) * 100).toFixed(2);
        }

        res.json({
            success: true,
            period,
            summary
        });
    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance summary'
        });
    }
});

/**
 * @route   GET /api/attendance/date/:date
 * @desc    Get attendance for a specific date
 * @access  Private
 */
router.get('/date/:date', authMiddleware, async (req, res) => {
    try {
        const targetDate = new Date(req.params.date);
        targetDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({
            date: targetDate
        })
            .populate('class')
            .populate('records.student')
            .populate('markedBy', '-password');

        res.json({
            success: true,
            count: attendance.length,
            attendance
        });
    } catch (error) {
        console.error('Get date attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance for date'
        });
    }
});

module.exports = router;
