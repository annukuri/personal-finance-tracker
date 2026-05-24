const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const bcrypt = require('bcryptjs');
const express = require('express');
const auth = require('./middleware/auth');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json()); 
app.use(cors());
app.use(express.static('public'));

// Route for User Schema CRUD operations

app.post('/api/users/register', async(req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // bcrypt code to hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        // Create and save the new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });        
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });               
        }          
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });               
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', userId: user._id, token: token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Route for Transaction Schema CRUD operations

app.post('/api/transactions', auth, async (req, res) => {
    try {
        const newTransaction = new Transaction({
            Ttype: req.body.Ttype,
            TCategory: req.body.TCategory,
            Amount: req.body.Amount,
            TDescrpt: req.body.TDescrpt,
            Tags: req.body.Tags,
            UserId: req.user.userId // Read securely from token payload
        });
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);        
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/transactions/summary', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ UserId: req.user.userId });
        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach(sum => {   
            if (sum.Ttype === 'Income') {
                totalIncome += sum.Amount;
            } else if (sum.Ttype === 'Expense') {
                totalExpense += sum.Amount;
            }   
        });
        const netbalance = totalIncome - totalExpense;
        res.json({ totalIncome, totalExpense, netbalance, totalTransactions: transactions.length });
    } catch (err) {
        res.status(500).json({ message: err.message });        
    }
});


app.get('/api/transactions', auth, async (req, res) => {
    try {
        // Read the verified id straight from req.user
        const transactions = await Transaction.find({ UserId: req.user.userId });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Added 'auth' and ownership checking so users can't spy on other users' transactions
app.get('/api/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);  
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }   
        if (transaction.UserId.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized to view this transaction' });
        }
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fixed: Added 'auth' middleware and early 'return' statements
app.put('/api/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transaction.UserId.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized to update this transaction' });
        }
        
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );        
        res.json(updatedTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transaction.UserId.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized to delete this transaction' });
        }
        
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,  // force IPv4
})
.then(() => console.log("MongoDB Connected!"))
.catch((err) => console.error("Database Connection Error:", err.message));