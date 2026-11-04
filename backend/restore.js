const fs = require('fs');
const path = require('path');

const files = {
    'src/middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

module.exports = authMiddleware;`,

    'src/middleware/adminMiddleware.js': `const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Admin access required" });
    }
};
module.exports = adminMiddleware;`,

    'src/middleware/errorMiddleware.js': `const errorMiddleware = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
module.exports = errorMiddleware;`,

    'src/routes/authRoutes.js': `const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/student/register', authController.studentRegister);
router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);
module.exports = router;`,

    'src/routes/topicRoutes.js': `const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);
router.post('/', authMiddleware, adminMiddleware, topicController.createTopic);
router.put('/:id', authMiddleware, adminMiddleware, topicController.updateTopic);
router.delete('/:id', authMiddleware, adminMiddleware, topicController.deleteTopic);
module.exports = router;`,

    'src/routes/examRoutes.js': `const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', examController.getAllExams);
router.get('/:id', authMiddleware, examController.getExamById);
router.post('/', authMiddleware, adminMiddleware, examController.createExam);
router.put('/:id', authMiddleware, adminMiddleware, examController.updateExam);
router.delete('/:id', authMiddleware, adminMiddleware, examController.deleteExam);
module.exports = router;`,

    'src/routes/questionRoutes.js': `const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/exam/:examId', authMiddleware, questionController.getQuestionsByExam);
router.get('/:id', authMiddleware, questionController.getQuestionById);
router.post('/', authMiddleware, adminMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, questionController.deleteQuestion);
module.exports = router;`,

    'src/routes/studentRoutes.js': `const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/exams', authMiddleware, studentController.getAvailableExams);
router.post('/exams/:examId/start', authMiddleware, studentController.startExam);
module.exports = router;`,

    'src/routes/answerRoutes.js': `const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:attemptId/answer', authMiddleware, answerController.submitAnswer);
module.exports = router;`,

    'src/routes/attemptRoutes.js': `const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:attemptId/submit', authMiddleware, attemptController.submitExam);
module.exports = router;`,

    'src/routes/resultRoutes.js': `const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/my-results', authMiddleware, resultController.getMyResults);
router.get('/:id', authMiddleware, resultController.getResultById);
router.get('/exam/:examId', authMiddleware, adminMiddleware, resultController.getResultsByExam);
module.exports = router;`,

    'src/routes/rankingRoutes.js': `const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/exam/:examId', authMiddleware, rankingController.getRankingByExam);
module.exports = router;`,

    'src/routes/adminRoutes.js': `const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.get('/attempts', adminController.getAttempts);
router.get('/results', adminController.getResults);
module.exports = router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const absolutePath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
}
console.log('Restored missing files');
