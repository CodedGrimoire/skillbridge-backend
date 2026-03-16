const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const signToken = (payload, options = {}) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...options });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { signToken, verifyToken };
