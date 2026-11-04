const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'online-exams-secret-jwt-key-2026';
    return jwt.sign({ id, role }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

module.exports = generateToken;
