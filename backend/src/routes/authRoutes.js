const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/student/register', authController.studentRegister);
router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);
module.exports = router;
