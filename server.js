const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const Transaction = require('./models/Transaction');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json()); 
app.use(cors());
console.log("Connecting to:", process.env.MONGO_URI);
// Route
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
