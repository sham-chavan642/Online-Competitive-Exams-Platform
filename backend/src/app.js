const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const errorMiddleware = require('./middleware/errorMiddleware');
const pool = require('./config/db');

const app = express();

// Middleware
app.use(helmet());

// Explicit origins for known local ports, plus any localhost port in
// non-production mode because Vite automatically selects the next free port.
const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    process.env.FRONTEND_ORIGIN
].filter(Boolean));

app.use(cors({
    origin(origin, callback) {
        const isLocalDevelopmentOrigin =
            process.env.NODE_ENV !== 'production' &&
            typeof origin === 'string' &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        // Allow non-browser requests, explicit origins, and local dev origins.
        if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin) {
            return callback(null, true);
        }
        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/student/attempts', require('./routes/attemptRoutes'));
app.use('/api/student/attempts', require('./routes/answerRoutes'));
app.use('/api/student/security', require('./routes/securityRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/ranking', require('./routes/rankingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const path = require('path');

// Health check endpoint
app.get('/api/health', async (req, res, next) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server is running but database is disconnected',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Serve frontend static assets
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// SPA fallback
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(distPath, 'index.html');
        return res.sendFile(indexPath, (err) => {
            if (err) {
                next();
            }
        });
    }
    next();
});

// 404 Route
app.use((req, res, next) => {
    const err = new Error('Route not found');
    err.statusCode = 404;
    next(err);
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
