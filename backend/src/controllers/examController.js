const pool = require('../config/db');

// MySQL DATETIME does not accept ISO-8601 timezone suffixes such as ".000Z".
// The frontend sends ISO dates, so normalize them at the API boundary.
const toMySqlDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 19).replace('T', ' ');
};

exports.createExam = async (req, res, next) => {
    try {
        const { topic_id, exam_name, description, duration, total_marks, start_time, end_time } = req.body;
        const requireCandidateDetails = req.body.require_candidate_details ?? true;
        const admin_id = req.user.id;

        if (!topic_id || !exam_name || !duration || !total_marks || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }
        if (!Number.isInteger(Number(duration)) || Number(duration) < 60) {
            return res.status(400).json({ success: false, message: 'Exam duration must be at least 60 minutes' });
        }
        if (typeof requireCandidateDetails !== 'boolean') {
            return res.status(400).json({ success: false, message: 'require_candidate_details must be a boolean' });
        }

        const mysqlStartTime = toMySqlDateTime(start_time);
        const mysqlEndTime = toMySqlDateTime(end_time);

        if (!mysqlStartTime || !mysqlEndTime) {
            return res.status(400).json({ success: false, message: 'Start time and end time must be valid dates' });
        }

        const [result] = await pool.query(
            'INSERT INTO exam (admin_id, topic_id, exam_name, description, duration, total_marks, start_time, end_time, require_candidate_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [admin_id, topic_id, exam_name, description || null, duration, total_marks, mysqlStartTime, mysqlEndTime, requireCandidateDetails ? 1 : 0]
        );

        console.info('[Exam created]', {
            exam_id: result.insertId,
            admin_id,
            topic_id,
            exam_name,
            description: description || null,
            duration,
            total_marks,
            start_time: mysqlStartTime,
            end_time: mysqlEndTime
        });

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: { exam_id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllExams = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM exam';
        let params = [];

        if (req.query.topic_id) {
            query += ' WHERE topic_id = ?';
            params.push(req.query.topic_id);
        }

        if (req.query.search) {
            if (params.length > 0) {
                query += ' AND exam_name LIKE ?';
            } else {
                query += ' WHERE exam_name LIKE ?';
            }
            params.push(`%${req.query.search}%`);
        }

        const [exams] = await pool.query(query, params);
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        next(error);
    }
};

exports.getExamById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [exams] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [id]);
        
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const exam = exams[0];
        
        // Fetch questions for this exam
        const [questions] = await pool.query('SELECT * FROM question WHERE exam_id = ?', [id]);
        
        for (let q of questions) {
            const [options] = await pool.query('SELECT * FROM question_option WHERE question_id = ?', [q.question_id]);
            
            // If requested by student, remove is_correct
            if (req.user && req.user.role === 'STUDENT') {
                q.options = options.map(opt => ({
                    option_id: opt.option_id,
                    question_id: opt.question_id,
                    option_text: opt.option_text
                }));
            } else {
                q.options = options;
            }
        }
        
        exam.questions = questions;

        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        next(error);
    }
};

exports.updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic_id, exam_name, description, duration, total_marks, start_time, end_time } = req.body;
        const requireCandidateDetails = req.body.require_candidate_details;

        if (!Number.isInteger(Number(duration)) || Number(duration) < 60) {
            return res.status(400).json({ success: false, message: 'Exam duration must be at least 60 minutes' });
        }
        if (requireCandidateDetails !== undefined && typeof requireCandidateDetails !== 'boolean') {
            return res.status(400).json({ success: false, message: 'require_candidate_details must be a boolean' });
        }

        const mysqlStartTime = toMySqlDateTime(start_time);
        const mysqlEndTime = toMySqlDateTime(end_time);

        if (!mysqlStartTime || !mysqlEndTime) {
            return res.status(400).json({ success: false, message: 'Start time and end time must be valid dates' });
        }

        const [result] = await pool.query(
            'UPDATE exam SET topic_id = ?, exam_name = ?, description = ?, duration = ?, total_marks = ?, start_time = ?, end_time = ?, require_candidate_details = COALESCE(?, require_candidate_details) WHERE exam_id = ?',
            [topic_id, exam_name, description, duration, total_marks, mysqlStartTime, mysqlEndTime, requireCandidateDetails === undefined ? null : (requireCandidateDetails ? 1 : 0), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, message: 'Exam updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM exam WHERE exam_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        next(error);
    }
};
