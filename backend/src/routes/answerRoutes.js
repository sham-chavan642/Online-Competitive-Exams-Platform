const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:attemptId/answer', authMiddleware, answerController.submitAnswer);
module.exports = router;
