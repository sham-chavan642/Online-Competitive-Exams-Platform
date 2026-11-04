const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:attemptId', authMiddleware, attemptController.getAttemptById);
router.post('/:attemptId/submit', authMiddleware, attemptController.submitExam);
module.exports = router;
