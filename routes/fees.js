const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/fees
 * @desc    Get all fees
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate({
                path: 'student',
                populate: { path: 'userId', select: '-password' }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: fees.length,
            fees
        });
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fees'
        });
    }
});

/**
 * @route   GET /api/fees/student/:studentId
 * @desc    Get fees by student
 * @access  Private
 */
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.params.studentId })
            .populate('payments.receivedBy', '-password')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: fees.length,
            fees
        });
    } catch (error) {
        console.error('Get student fees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student fees'
        });
    }
});

/**
 * @route   GET /api/fees/due
 * @desc    Get all due fees
 * @access  Private/Admin
 */
router.get('/due', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const dueFees = await Fee.find({
            dueAmount: { $gt: 0 }
        })
            .populate({
                path: 'student',
                populate: { path: 'userId', select: '-password' }
            })
            .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: dueFees.length,
            fees: dueFees
        });
    } catch (error) {
        console.error('Get due fees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching due fees'
        });
    }
});

/**
 * @route   POST /api/fees
 * @desc    Create fee structure for student
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            studentId, academicYear, feeStructure, dueDate
        } = req.body;

        // Calculate total amount
        const totalAmount = feeStructure.reduce((sum, fee) => sum + fee.amount, 0);

        const fee = new Fee({
            student: studentId,
            academicYear,
            feeStructure,
            totalAmount,
            dueDate
        });

        await fee.save();

        const populatedFee = await Fee.findById(fee._id)
            .populate({
                path: 'student',
                populate: { path: 'userId', select: '-password' }
            });

        res.status(201).json({
            success: true,
            message: 'Fee structure created successfully',
            fee: populatedFee
        });
    } catch (error) {
        console.error('Create fee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating fee structure',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/fees/:id/payment
 * @desc    Add payment to fee
 * @access  Private/Admin
 */
router.post('/:id/payment', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, remarks } = req.body;

        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        // Add payment
        fee.payments.push({
            amount,
            paymentMethod,
            transactionId,
            remarks,
            receivedBy: req.user.id
        });

        // Update paid amount
        fee.paidAmount += amount;

        await fee.save();

        const updatedFee = await Fee.findById(fee._id)
            .populate({
                path: 'student',
                populate: { path: 'userId', select: '-password' }
            })
            .populate('payments.receivedBy', '-password');

        res.json({
            success: true,
            message: 'Payment added successfully',
            fee: updatedFee
        });
    } catch (error) {
        console.error('Add payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding payment'
        });
    }
});

/**
 * @route   GET /api/fees/receipt/:feeId/:paymentIndex
 * @desc    Get payment receipt
 * @access  Private
 */
router.get('/receipt/:feeId/:paymentIndex', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.feeId)
            .populate({
                path: 'student',
                populate: { path: 'userId class' }
            })
            .populate('payments.receivedBy', '-password');

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        const payment = fee.payments[req.params.paymentIndex];

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const receipt = {
            receiptNumber: payment.receiptNumber,
            date: payment.paymentDate,
            studentInfo: {
                studentId: fee.student.studentId,
                name: fee.student.userId.fullName,
                class: fee.student.class?.className,
                section: fee.student.class?.section
            },
            payment: {
                amount: payment.amount,
                method: payment.paymentMethod,
                transactionId: payment.transactionId,
                remarks: payment.remarks
            },
            feeDetails: {
                academicYear: fee.academicYear,
                totalAmount: fee.totalAmount,
                paidAmount: fee.paidAmount,
                dueAmount: fee.dueAmount,
                status: fee.status
            },
            receivedBy: payment.receivedBy?.fullName
        };

        res.json({
            success: true,
            receipt
        });
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipt'
        });
    }
});

/**
 * @route   PUT /api/fees/:id
 * @desc    Update fee structure
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        const { feeStructure, dueDate } = req.body;

        if (feeStructure) {
            fee.feeStructure = feeStructure;
            fee.totalAmount = feeStructure.reduce((sum, f) => sum + f.amount, 0);
        }

        if (dueDate) {
            fee.dueDate = dueDate;
        }

        await fee.save();

        const updatedFee = await Fee.findById(fee._id)
            .populate({
                path: 'student',
                populate: { path: 'userId', select: '-password' }
            });

        res.json({
            success: true,
            message: 'Fee structure updated successfully',
            fee: updatedFee
        });
    } catch (error) {
        console.error('Update fee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating fee structure'
        });
    }
});

/**
 * @route   DELETE /api/fees/:id
 * @desc    Delete fee record
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        await Fee.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Fee record deleted successfully'
        });
    } catch (error) {
        console.error('Delete fee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting fee record'
        });
    }
});

module.exports = router;
