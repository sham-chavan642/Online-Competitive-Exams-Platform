const pool = require('../config/db');
const { randomInt } = require('crypto');
const evaluationService = require('../services/evaluationService');

exports.submitExam = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        await connection.beginTransaction();

        // Verify attempt belongs to student
        const [attempts] = await connection.query('SELECT * FROM attempt WHERE attempt_id = ? AND student_id = ? FOR UPDATE', [attemptId, studentId]);
        
        if (attempts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const attempt = attempts[0];

        if (attempt.status !== 'IN_PROGRESS') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Attempt already submitted or expired' });
        }

        const result = await evaluationService.finalizeAttempt(attempt, connection, false);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                score: result.score,
                total_marks: result.total_marks,
                percentage: result.percentage,
                result_status: result.result_status
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

exports.getAttemptById = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        const [attempts] = await pool.query('SELECT * FROM attempt WHERE attempt_id = ? AND student_id = ?', [attemptId, studentId]);
        if (attempts.length === 0) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }
        const attempt = attempts[0];

        const [exams] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [attempt.exam_id]);
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        const exam = exams[0];
        const remainingTimeQuery = pool.databaseDialect === 'mysql'
            ? `SELECT GREATEST(0, (? * 60) - TIMESTAMPDIFF(SECOND, started_at, CURRENT_TIMESTAMP)) AS remaining_seconds
               FROM attempt WHERE attempt_id = ?`
            : `SELECT MAX(0, (? * 60) - (
                   CAST(strftime('%s', 'now') AS INTEGER) - CAST(strftime('%s', started_at) AS INTEGER)
               )) AS remaining_seconds
               FROM attempt WHERE attempt_id = ?`;
        const [timerRows] = await pool.query(remainingTimeQuery, [Number(exam.duration), attemptId]);
        const remainingSeconds = Number(timerRows[0]?.remaining_seconds);
        if (!Number.isFinite(remainingSeconds)) {
            throw new Error(`Could not calculate remaining time for attempt ${attemptId}`);
        }
        attempt.remaining_seconds = remainingSeconds;

        const [questionRows] = await pool.query('SELECT question_id, exam_id, question_text, question_type, marks FROM question WHERE exam_id = ?', [exam.exam_id]);
        let questionOrder = attempt.question_order;
        if (!questionOrder) {
            const shuffled = [...questionRows];
            for (let index = shuffled.length - 1; index > 0; index -= 1) {
                const swapIndex = randomInt(index + 1);
                [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
            }
            await pool.query(
                'UPDATE attempt SET question_order = ? WHERE attempt_id = ? AND question_order IS NULL',
                [JSON.stringify(shuffled.map((question) => question.question_id)), attemptId]
            );
            const [updatedAttempts] = await pool.query('SELECT question_order FROM attempt WHERE attempt_id = ?', [attemptId]);
            questionOrder = updatedAttempts[0]?.question_order;
        }

        const orderedIds = typeof questionOrder === 'string' ? JSON.parse(questionOrder) : questionOrder;
        if (!Array.isArray(orderedIds) || orderedIds.length !== questionRows.length) {
            throw new Error(`Stored question order is invalid for attempt ${attemptId}`);
        }
        const questionsById = new Map(questionRows.map((question) => [String(question.question_id), question]));
        const questions = orderedIds.map((questionId) => questionsById.get(String(questionId)));
        if (questions.some((question) => !question)) {
            throw new Error(`Stored question order references an unknown question for attempt ${attemptId}`);
        }

        for (let q of questions) {
            const [options] = await pool.query('SELECT option_id, question_id, option_text FROM question_option WHERE question_id = ?', [q.question_id]);
            q.options = options;
        }
        exam.questions = questions;

        const [answers] = await pool.query('SELECT question_id, option_id FROM answer WHERE attempt_id = ?', [attemptId]);

        res.status(200).json({
            success: true,
            data: {
                attempt,
                exam,
                answers
            }
        });
    } catch (error) {
        next(error);
    }
};
