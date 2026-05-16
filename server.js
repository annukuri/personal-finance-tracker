const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const bcrypt = require('bcryptjs');
const express = require('express');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json()); 
app.use(cors());
//Route for User Schema CRUD operations

app.post('/api/users/register', async(req, res) => //register
{
    try{
        const existingUser = await User.findOne({ email:req.body.email });
        if(existingUser)
        {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        // bcyrpt code to hash the password
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
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/users/login', async (req, res) => //login
{
    try{
        const user = await User.findOne({ email: req.body.email });
        if(!user)
            {
                res.status(400).json({ message: 'Invalid email or password' });
                return;                
            }          
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if(!isMatch)
            {
                res.status(400).json({ message: 'Invalid email or password' });
                return;                
             }  
        res.json({ message: 'Login successful', userId: user._id });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Route for Transaction Schema CRUD operations
app.post('/api/transactions', async (req, res) => {
    try {
        const newTransaction = new Transaction({
            Ttype: req.body.Ttype,
            TCategory: req.body.TCategory,
            Amount: req.body.Amount,
            TDescrpt: req.body.TDescrpt,
            Tags: req.body.Tags,
            UserId: req.body.UserId
        });
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);        
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);  
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }   
        res.json(transaction);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted' });
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
