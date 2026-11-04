const pool = require('../config/db');

exports.getMyResults = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const [results] = await pool.query(`
            SELECT r.*, e.exam_name 
            FROM result r 
            JOIN exam e ON r.exam_id = e.exam_id 
            WHERE r.student_id = ?
        `, [studentId]);
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};

exports.getResultById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [results] = await pool.query(`
            SELECT r.*, e.exam_name, e.total_marks, s.name as student_name
            FROM result r
            JOIN exam e ON r.exam_id = e.exam_id
            JOIN student s ON r.student_id = s.student_id
            WHERE r.result_id = ?
        `, [id]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        const result = results[0];

        // Access control: only admin or the student themselves can view the result
        if (req.user.role !== 'ADMIN' && req.user.id !== result.student_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        next(error);
    }
};

exports.getResultsByExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const [results] = await pool.query(`
            SELECT r.*, s.name as student_name 
            FROM result r 
            JOIN student s ON r.student_id = s.student_id 
            WHERE r.exam_id = ?
        `, [examId]);
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};
