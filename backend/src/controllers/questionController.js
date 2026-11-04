const pool = require('../config/db');

exports.createQuestion = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { exam_id, question_text, question_type, marks, options } = req.body;

        if (!exam_id || !question_text || !marks || !options || options.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate exam
        const [exams] = await connection.query('SELECT exam_id FROM exam WHERE exam_id = ?', [exam_id]);
        if (exams.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Insert question
        const [qResult] = await connection.query(
            'INSERT INTO question (exam_id, question_text, question_type, marks) VALUES (?, ?, ?, ?)',
            [exam_id, question_text, question_type || 'MCQ', marks]
        );

        const question_id = qResult.insertId;

        // Insert options
        for (let opt of options) {
            await connection.query(
                'INSERT INTO question_option (question_id, option_text, is_correct) VALUES (?, ?, ?)',
                [question_id, opt.option_text, opt.is_correct ? 1 : 0]
            );
        }

        await connection.commit();

        console.info('[Question created]', {
            question_id,
            exam_id,
            question_text,
            question_type: question_type || 'MCQ',
            marks,
            option_count: options.length
        });

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: { question_id }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

exports.getQuestionsByExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        
        const [questions] = await pool.query('SELECT * FROM question WHERE exam_id = ?', [examId]);
        
        for (let q of questions) {
            const [options] = await pool.query('SELECT * FROM question_option WHERE question_id = ?', [q.question_id]);
            
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

        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        next(error);
    }
};

exports.getQuestionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [questions] = await pool.query('SELECT * FROM question WHERE question_id = ?', [id]);
        
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const question = questions[0];
        const [options] = await pool.query('SELECT * FROM question_option WHERE question_id = ?', [id]);
        
        if (req.user && req.user.role === 'STUDENT') {
            question.options = options.map(opt => ({
                option_id: opt.option_id,
                question_id: opt.question_id,
                option_text: opt.option_text
            }));
        } else {
            question.options = options;
        }

        res.status(200).json({ success: true, data: question });
    } catch (error) {
        next(error);
    }
};

exports.updateQuestion = async (req, res, next) => {
    // Basic implementation for PUT question
    try {
        const { id } = req.params;
        const { question_text, question_type, marks } = req.body;
        
        const [result] = await pool.query(
            'UPDATE question SET question_text = ?, question_type = ?, marks = ? WHERE question_id = ?',
            [question_text, question_type, marks, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.status(200).json({ success: true, message: 'Question updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM question WHERE question_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        next(error);
    }
};
