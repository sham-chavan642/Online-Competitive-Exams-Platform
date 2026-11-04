const pool = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const [[{ total_students }]] = await pool.query('SELECT COUNT(*) as total_students FROM student');
        const [[{ total_exams }]] = await pool.query('SELECT COUNT(*) as total_exams FROM exam');
        const [[{ total_questions }]] = await pool.query('SELECT COUNT(*) as total_questions FROM question');
        const [[{ total_topics }]] = await pool.query('SELECT COUNT(*) as total_topics FROM topic');
        const [[{ total_attempts }]] = await pool.query('SELECT COUNT(*) as total_attempts FROM attempt');
        const [[{ completed_attempts }]] = await pool.query("SELECT COUNT(*) as completed_attempts FROM attempt WHERE status = 'SUBMITTED'");

        res.status(200).json({
            success: true,
            data: {
                total_students,
                total_exams,
                total_questions,
                total_topics,
                total_attempts,
                completed_attempts
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getStudents = async (req, res, next) => {
    try {
        let query = 'SELECT student_id, name, email, gender, phone FROM student';
        let params = [];

        if (req.query.search) {
            query += ' WHERE name LIKE ? OR email LIKE ?';
            params.push(`%${req.query.search}%`, `%${req.query.search}%`);
        }

        const [students] = await pool.query(query, params);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        next(error);
    }
};

exports.getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [students] = await pool.query('SELECT student_id, name, email, gender, phone FROM student WHERE student_id = ?', [id]);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];
        
        // Examination history
        const [history] = await pool.query(`
            SELECT a.attempt_id, a.exam_id, e.exam_name, a.status, a.score, a.started_at, a.submitted_at 
            FROM attempt a
            JOIN exam e ON a.exam_id = e.exam_id
            WHERE a.student_id = ?
        `, [id]);

        student.history = history;

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

exports.getAttempts = async (req, res, next) => {
    try {
        const [attempts] = await pool.query(`
            SELECT a.*, s.name as student_name, e.exam_name, e.duration AS exam_duration
            FROM attempt a
            JOIN student s ON a.student_id = s.student_id
            JOIN exam e ON a.exam_id = e.exam_id
        `);
        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        next(error);
    }
};

exports.getResults = async (req, res, next) => {
    try {
        const [results] = await pool.query(`
            SELECT r.*, COALESCE(a.candidate_name, s.name) as student_name,
                   a.candidate_prn, e.exam_name
            FROM result r
            JOIN student s ON r.student_id = s.student_id
            JOIN exam e ON r.exam_id = e.exam_id
            JOIN attempt a ON a.attempt_id = r.attempt_id
            ORDER BY e.exam_name ASC, r.score DESC, r.generated_at ASC, r.result_id ASC
        `);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};
