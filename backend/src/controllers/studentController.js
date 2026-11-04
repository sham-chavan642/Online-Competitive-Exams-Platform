const pool = require('../config/db');
const { randomInt } = require('crypto');

const shuffleQuestions = (questions) => {
    const shuffledQuestions = [...questions];
    for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInt(index + 1);
        [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [shuffledQuestions[swapIndex], shuffledQuestions[index]];
    }
    return shuffledQuestions;
};

exports.getAvailableExams = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        
        // Return exams where current time is between start_time and end_time
        // And the student has not attempted them yet
        const query = `
            SELECT e.* 
            FROM exam e
            LEFT JOIN attempt a ON e.exam_id = a.exam_id AND a.student_id = ?
            WHERE CURRENT_TIMESTAMP >= e.start_time
              AND CURRENT_TIMESTAMP <= e.end_time
              AND a.attempt_id IS NULL
        `;
        
        const [exams] = await pool.query(query, [studentId]);
        
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        next(error);
    }
};

exports.startExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const studentId = req.user.id;
        const candidateName = typeof req.body.candidate_name === 'string' ? req.body.candidate_name.trim() : '';
        const candidatePrn = typeof req.body.candidate_prn === 'string' ? req.body.candidate_prn.trim() : '';

        const [exams] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [examId]);
        
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        
        const exam = exams[0];
        const requiresCandidateDetails = Boolean(exam.require_candidate_details);
        if (requiresCandidateDetails && (!candidateName || !candidatePrn)) {
            return res.status(400).json({
                success: false,
                message: 'Candidate name and PRN are required before starting this exam'
            });
        }
        if (candidateName.length > 255 || candidatePrn.length > 100) {
            return res.status(400).json({ success: false, message: 'Candidate name or PRN exceeds the allowed length' });
        }
        const currentTime = new Date();
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        if (currentTime < startTime || currentTime > endTime) {
            return res.status(400).json({ success: false, message: 'Exam is not active at this time' });
        }

        // Check if student already attempted
        const [attempts] = await pool.query('SELECT * FROM attempt WHERE student_id = ? AND exam_id = ?', [studentId, examId]);
        
        if (attempts.length > 0) {
            return res.status(409).json({ success: false, message: 'You have already attempted this exam' });
        }

        const [questions] = await pool.query('SELECT * FROM question WHERE exam_id = ?', [examId]);
        const shuffledQuestions = shuffleQuestions(questions);

        for (let q of shuffledQuestions) {
            const [options] = await pool.query('SELECT option_id, question_id, option_text FROM question_option WHERE question_id = ?', [q.question_id]);
            q.options = options;
        }

        // Store the question order so a refresh or recovery keeps the same sequence.
        const [result] = await pool.query(
            'INSERT INTO attempt (student_id, exam_id, status, started_at, question_order, candidate_name, candidate_prn) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            [
                studentId,
                examId,
                'IN_PROGRESS',
                JSON.stringify(shuffledQuestions.map((question) => question.question_id)),
                candidateName || null,
                candidatePrn || null
            ]
        );

        const attemptId = result.insertId;
        exam.questions = shuffledQuestions;

        res.status(201).json({
            success: true,
            data: {
                attempt_id: attemptId,
                exam
            }
        });
    } catch (error) {
        next(error);
    }
};
