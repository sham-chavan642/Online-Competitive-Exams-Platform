const pool = require('../config/db');

exports.submitAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const question_id = req.body.question_id || req.body.questionId;
        const option_id = req.body.option_id || req.body.selectedOptionId || req.body.optionId;
        const studentId = req.user.id;

        if (!question_id || !option_id) {
            return res.status(400).json({ success: false, message: 'question_id and option_id are required' });
        }

        // Verify attempt belongs to student and is IN_PROGRESS
        const [attempts] = await pool.query('SELECT * FROM attempt WHERE attempt_id = ? AND student_id = ?', [attemptId, studentId]);
        
        if (attempts.length === 0) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const attempt = attempts[0];

        if (attempt.status !== 'IN_PROGRESS') {
            return res.status(400).json({ success: false, message: 'Cannot answer, attempt is no longer in progress' });
        }

        // Verify question belongs to exam
        const [questions] = await pool.query('SELECT * FROM question WHERE question_id = ? AND exam_id = ?', [question_id, attempt.exam_id]);
        if (questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Question does not belong to this exam' });
        }

        // Verify option belongs to question
        const [options] = await pool.query('SELECT * FROM question_option WHERE option_id = ? AND question_id = ?', [option_id, question_id]);
        if (options.length === 0) {
            return res.status(400).json({ success: false, message: 'Option does not belong to this question' });
        }

        // Insert or update answer
        await pool.query(
            `INSERT INTO answer (attempt_id, question_id, option_id, answered_at) 
             VALUES (?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), answered_at = NOW()`,
            [attemptId, question_id, option_id]
        );

        res.status(200).json({ success: true, message: 'Answer saved' });
    } catch (error) {
        next(error);
    }
};
