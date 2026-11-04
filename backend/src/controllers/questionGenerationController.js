const pool = require('../config/db');
const questionGenerationService = require('../services/questionGenerationService');

exports.generateQuestions = async (req, res, next) => {
    try {
        const examId = Number(req.body.exam_id);
        const count = Number(req.body.count);
        const difficulty = req.body.difficulty;
        const { source_text: sourceText } = req.body;

        if (!Number.isInteger(examId) || examId < 1) {
            return res.status(400).json({ success: false, message: 'Select a valid examination.' });
        }
        if (!Number.isInteger(count) || count < 1 || count > 20) {
            return res.status(400).json({ success: false, message: 'Question count must be between 1 and 20.' });
        }
        if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
            return res.status(400).json({ success: false, message: 'Select a valid question difficulty.' });
        }
        if (typeof sourceText !== 'string' || sourceText.trim().length < 50 || sourceText.length > 30000) {
            return res.status(400).json({ success: false, message: 'Provide syllabus or notes between 50 and 30,000 characters.' });
        }

        const [exams] = await pool.query('SELECT exam_id FROM exam WHERE exam_id = ?', [examId]);
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Examination not found.' });
        }

        const questions = await questionGenerationService.generateQuestions({
            sourceText,
            count,
            difficulty
        });
        res.status(200).json({ success: true, data: { questions } });
    } catch (error) {
        next(error);
    }
};
