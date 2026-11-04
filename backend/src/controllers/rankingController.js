const pool = require('../config/db');

exports.getRankingByExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        
        const query = `
            SELECT 
                RANK() OVER (ORDER BY a.score DESC) as \`rank\`,
                s.student_id,
                COALESCE(a.candidate_name, s.name) as student_name,
                a.candidate_prn,
                a.score,
                (a.score / e.total_marks) * 100 as percentage
            FROM attempt a
            JOIN student s ON a.student_id = s.student_id
            JOIN exam e ON a.exam_id = e.exam_id
            WHERE a.exam_id = ? AND a.status = 'SUBMITTED'
            ORDER BY a.score DESC, a.submitted_at ASC, a.attempt_id ASC
        `;

        const [ranking] = await pool.query(query, [examId]);

        res.status(200).json({ success: true, ranking });
    } catch (error) {
        next(error);
    }
};
