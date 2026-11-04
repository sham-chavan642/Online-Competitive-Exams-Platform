const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use((req, res, next) => {
    if (req.user.role !== 'STUDENT') {
        return res.status(403).json({ success: false, message: 'Student access required' });
    }
    next();
});
router.get('/attempts/:attemptId/settings', securityController.getAttemptSettings);
router.post('/attempts/:attemptId/events', securityController.recordEvent);

module.exports = router;
