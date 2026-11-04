const pool = require('../config/db');

exports.evaluateAttempt = async (attemptId, connection) => {
    // We assume connection is a transaction-enabled connection
    const [attempts] = await connection.query('SELECT * FROM attempt WHERE attempt_id = ?', [attemptId]);
    const attempt = attempts[0];
    
    if (!attempt) throw new Error('Attempt not found');
    
    const [examDetails] = await connection.query('SELECT total_marks FROM exam WHERE exam_id = ?', [attempt.exam_id]);
    const totalMarks = examDetails[0].total_marks;

    // Fetch all questions and their correct options
    const [questions] = await connection.query('SELECT * FROM question WHERE exam_id = ?', [attempt.exam_id]);
    
    // Fetch all student's answers
    const [answers] = await connection.query('SELECT * FROM answer WHERE attempt_id = ?', [attemptId]);
    
    let score = 0;

    for (let question of questions) {
        const [correctOptions] = await connection.query('SELECT option_id FROM question_option WHERE question_id = ? AND is_correct = 1', [question.question_id]);
        if (correctOptions.length === 0) continue; // No correct option defined?
        
        const correctOptionId = correctOptions[0].option_id;

        const studentAnswer = answers.find(a => a.question_id === question.question_id);
        
        if (studentAnswer && studentAnswer.option_id === correctOptionId) {
            score += question.marks;
        }
    }

    const percentage = (score / totalMarks) * 100;

    return {
        score,
        totalMarks,
        percentage
    };
};

exports.finalizeAttempt = async (attempt, connection, autoSubmitted = false) => {
    const evaluation = await exports.evaluateAttempt(attempt.attempt_id, connection);
    const resultStatus = evaluation.percentage >= 50 ? 'PASS' : 'FAIL';

    await connection.query(
        'UPDATE attempt SET status = ?, submitted_at = NOW(), score = ?, auto_submitted = ? WHERE attempt_id = ?',
        ['SUBMITTED', evaluation.score, autoSubmitted ? 1 : 0, attempt.attempt_id]
    );

    const [insertResult] = await connection.query(
        'INSERT INTO result (attempt_id, student_id, exam_id, score, percentage, result_status, generated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [attempt.attempt_id, attempt.student_id, attempt.exam_id, evaluation.score, evaluation.percentage, resultStatus]
    );

    return {
        score: evaluation.score,
        total_marks: evaluation.totalMarks,
        percentage: evaluation.percentage.toFixed(2),
        result_status: resultStatus,
        result_id: insertResult.insertId
    };
};
