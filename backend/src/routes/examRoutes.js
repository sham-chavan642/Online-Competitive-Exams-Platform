const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', examController.getAllExams);
router.get('/:id', authMiddleware, examController.getExamById);
router.post('/', authMiddleware, adminMiddleware, examController.createExam);
router.put('/:id', authMiddleware, adminMiddleware, examController.updateExam);
router.delete('/:id', authMiddleware, adminMiddleware, examController.deleteExam);
module.exports = router;
