const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    feeStructure: [{
        category: {
            type: String,
            required: true // e.g., Tuition, Transport, Library, Lab, Sports
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number
    },
    payments: [{
        receiptNumber: {
            type: String,
            unique: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'Online', 'Cheque'],
            required: true
        },
        transactionId: {
            type: String
        },
        remarks: {
            type: String
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    status: {
        type: String,
        enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
        default: 'Pending'
    },
    dueDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate due amount before saving
feeSchema.pre('save', function (next) {
    this.dueAmount = this.totalAmount - this.paidAmount;

    // Update status based on payment
    if (this.paidAmount === 0) {
        this.status = 'Pending';
    } else if (this.paidAmount >= this.totalAmount) {
        this.status = 'Paid';
    } else {
        this.status = 'Partial';
    }

    // Check if overdue
    if (this.dueDate && new Date() > this.dueDate && this.dueAmount > 0) {
        this.status = 'Overdue';
    }

    next();
});

// Auto-generate receipt number for payments
feeSchema.pre('save', async function (next) {
    for (let payment of this.payments) {
        if (!payment.receiptNumber) {
            const year = new Date().getFullYear();
            const count = await mongoose.model('Fee').countDocuments();
            payment.receiptNumber = `RCP${year}${String(count + 1).padStart(6, '0')}`;
        }
    }
    next();
});

module.exports = mongoose.model('Fee', feeSchema);
