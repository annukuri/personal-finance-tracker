const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Grab the token from the hidden Request Header
    const authHeader = req.header('Authorization');
    
    // Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        // Extract the raw token string by splitting out the word "Bearer "
        const token = authHeader.split(' ')[1];

        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Take the userId out of the token and attach it to the 'req' object
        req.user = decoded; 
        
        // Pass control to your actual route code
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid or has expired' });
    }
};

module.exports = auth;