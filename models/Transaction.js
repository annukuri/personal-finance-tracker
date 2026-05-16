const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    Ttype: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    TCategory: {
        type: String,
        required: true,
        enum: ['Salary', 'Fixed', 'Gifts', 'Savings', 'Others', 'Food', 'Self-Treat'], 
        default: 'Others'
    },
    Amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    TDescrpt: {
        type: String,
        trim: true, 
        maxlength: [200, 'Description is too long']
    },
    Tags: {
        type: [String], 
        default: []
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); 

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;