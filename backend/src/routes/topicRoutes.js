const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);
router.post('/', authMiddleware, adminMiddleware, topicController.createTopic);
router.put('/:id', authMiddleware, adminMiddleware, topicController.updateTopic);
router.delete('/:id', authMiddleware, adminMiddleware, topicController.deleteTopic);
module.exports = router;
