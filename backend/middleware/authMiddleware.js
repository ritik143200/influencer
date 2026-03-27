const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artist = require('../models/influencer');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            if (token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Not authorized, token is missing or invalid' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token, checking both collections
            let user = await User.findById(decoded.id).select('-password');
            if (!user) {
                user = await Artist.findById(decoded.id).select('-password');
            }

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(`Auth Error: ${error.message} - Invalid or expired token`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
