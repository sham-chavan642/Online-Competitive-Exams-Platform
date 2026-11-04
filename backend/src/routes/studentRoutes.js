const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/exams', authMiddleware, studentController.getAvailableExams);
router.post('/exams/:examId/start', authMiddleware, studentController.startExam);
module.exports = router;
