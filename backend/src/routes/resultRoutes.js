const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/my-results', authMiddleware, resultController.getMyResults);
router.get('/:id', authMiddleware, resultController.getResultById);
router.get('/exam/:examId', authMiddleware, adminMiddleware, resultController.getResultsByExam);
module.exports = router;
