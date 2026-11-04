const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/exam/:examId', authMiddleware, rankingController.getRankingByExam);
module.exports = router;
