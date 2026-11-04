const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/exam/:examId', authMiddleware, questionController.getQuestionsByExam);
router.get('/:id', authMiddleware, questionController.getQuestionById);
router.post('/', authMiddleware, adminMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, questionController.deleteQuestion);
module.exports = router;
