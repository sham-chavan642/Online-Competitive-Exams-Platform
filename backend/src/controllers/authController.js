const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.studentRegister = async (req, res, next) => {
    try {
        const { name, email, password, gender, phone } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        // Check if email exists
        const [existing] = await pool.query('SELECT student_id FROM student WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert
        await pool.query(
            'INSERT INTO student (name, email, password, gender, phone) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, gender || null, phone || null]
        );

        res.status(201).json({ success: true, message: 'Student registered successfully' });
    } catch (error) {
        next(error);
    }
};

exports.studentLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const [users] = await pool.query('SELECT * FROM student WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user.student_id, 'STUDENT');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.student_id,
                name: user.name,
                email: user.email,
                role: 'STUDENT'
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const [admins] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
        const admin = admins[0];

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(admin.admin_id, 'ADMIN');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email,
                role: 'ADMIN'
            }
        });
    } catch (error) {
        next(error);
    }
};
