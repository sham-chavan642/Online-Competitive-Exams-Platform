const pool = require('../config/db');

exports.createTopic = async (req, res, next) => {
    try {
        const { topic_name, description } = req.body;

        if (!topic_name) {
            return res.status(400).json({ success: false, message: 'Topic name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO topic (topic_name, description) VALUES (?, ?)',
            [topic_name, description || null]
        );

        console.info('[Topic created]', {
            topic_id: result.insertId,
            topic_name,
            description: description || null
        });

        res.status(201).json({
            success: true,
            message: 'Topic created successfully',
            data: { topic_id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllTopics = async (req, res, next) => {
    try {
        const [topics] = await pool.query('SELECT * FROM topic');
        res.status(200).json({ success: true, data: topics });
    } catch (error) {
        next(error);
    }
};

exports.getTopicById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [topics] = await pool.query('SELECT * FROM topic WHERE topic_id = ?', [id]);
        
        if (topics.length === 0) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({ success: true, data: topics[0] });
    } catch (error) {
        next(error);
    }
};

exports.updateTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic_name, description } = req.body;

        const [result] = await pool.query(
            'UPDATE topic SET topic_name = ?, description = ? WHERE topic_id = ?',
            [topic_name, description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({ success: true, message: 'Topic updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM topic WHERE topic_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({ success: true, message: 'Topic deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ success: false, message: 'Cannot delete topic. It is associated with exams.' });
        }
        next(error);
    }
};
