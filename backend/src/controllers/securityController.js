const pool = require('../config/db');
const evaluationService = require('../services/evaluationService');

const SECURITY_EVENTS = new Set([
    'tab_hidden',
    'fullscreen_exit',
    'copy_attempt',
    'cut_attempt',
    'paste_attempt',
    'context_menu_attempt',
    'camera_started',
    'camera_stopped',
    'camera_permission_denied',
    'camera_disconnected',
    'face_detection_unavailable',
    'face_missing',
    'multiple_faces'
]);

const DEFAULT_SETTINGS = { violation_limit: 3, auto_submit: 0 };

exports.getAttemptSettings = async (req, res, next) => {
    try {
        const [attempts] = await pool.query(
            'SELECT exam_id FROM attempt WHERE attempt_id = ? AND student_id = ?',
            [req.params.attemptId, req.user.id]
        );
        if (attempts.length === 0) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const [settings] = await pool.query(
            'SELECT violation_limit, auto_submit FROM exam_security_settings WHERE exam_id = ?',
            [attempts[0].exam_id]
        );
        const [[{ violation_count }]] = await pool.query(
            `SELECT COUNT(*) AS violation_count
             FROM exam_security_event
             WHERE attempt_id = ?
               AND event_type NOT IN ('camera_started', 'camera_stopped', 'face_detection_unavailable', 'admin_recovered')
               AND event_id > COALESCE(
                   (SELECT MAX(event_id) FROM exam_security_event WHERE attempt_id = ? AND event_type = 'admin_recovered'),
                   0
               )`,
            [req.params.attemptId, req.params.attemptId]
        );
        res.status(200).json({
            success: true,
            data: { ...(settings[0] || DEFAULT_SETTINGS), violation_count }
        });
    } catch (error) {
        next(error);
    }
};

exports.recordEvent = async (req, res, next) => {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;
        const { eventType, details } = req.body;

        if (typeof eventType !== 'string' || !SECURITY_EVENTS.has(eventType)) {
            return res.status(400).json({ success: false, message: 'Invalid security event type' });
        }
        if (details != null && (typeof details !== 'string' || details.length > 255)) {
            return res.status(400).json({ success: false, message: 'Event details must be 255 characters or fewer' });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        const [attempts] = await connection.query(
            'SELECT * FROM attempt WHERE attempt_id = ? AND student_id = ? FOR UPDATE',
            [attemptId, studentId]
        );
        if (attempts.length === 0) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }
        const attempt = attempts[0];
        if (attempt.status !== 'IN_PROGRESS') {
            await connection.rollback();
            transactionStarted = false;
            return res.status(400).json({ success: false, message: 'Attempt is no longer in progress' });
        }

        await connection.query(
            'INSERT INTO exam_security_event (attempt_id, student_id, exam_id, event_type, details) VALUES (?, ?, ?, ?, ?)',
            [attemptId, studentId, attempt.exam_id, eventType, details || null]
        );
        const [[{ violation_count }]] = await connection.query(
            `SELECT COUNT(*) AS violation_count
             FROM exam_security_event
             WHERE attempt_id = ?
               AND event_type NOT IN ('camera_started', 'camera_stopped', 'face_detection_unavailable', 'admin_recovered')
               AND event_id > COALESCE(
                   (SELECT MAX(event_id) FROM exam_security_event WHERE attempt_id = ? AND event_type = 'admin_recovered'),
                   0
               )`,
            [attemptId, attemptId]
        );
        const [settingRows] = await connection.query(
            'SELECT violation_limit, auto_submit FROM exam_security_settings WHERE exam_id = ?',
            [attempt.exam_id]
        );
        const settings = settingRows[0] || DEFAULT_SETTINGS;
        let result = null;
        const autoSubmitted = Boolean(settings.auto_submit) && violation_count >= settings.violation_limit;

        if (autoSubmitted) {
            result = await evaluationService.finalizeAttempt(attempt, connection, true);
        }

        await connection.commit();
        transactionStarted = false;
        res.status(201).json({
            success: true,
            data: {
                violation_count,
                violation_limit: settings.violation_limit,
                auto_submitted: autoSubmitted,
                result_id: result?.result_id
            }
        });
    } catch (error) {
        if (transactionStarted) await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

exports.recoverAutoSubmittedAttempt = async (req, res, next) => {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;
        const [attempts] = await connection.query(
            'SELECT * FROM attempt WHERE attempt_id = ? FOR UPDATE',
            [req.params.attemptId]
        );
        if (attempts.length === 0) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }
        const attempt = attempts[0];
        if (attempt.status !== 'SUBMITTED' || Number(attempt.auto_submitted) !== 1) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(409).json({
                success: false,
                message: 'Only attempts auto-submitted by the security limit can be recovered'
            });
        }

        await connection.query('DELETE FROM result WHERE attempt_id = ?', [attempt.attempt_id]);
        await connection.query(
            'UPDATE attempt SET status = ?, started_at = NOW(), submitted_at = NULL, score = NULL, auto_submitted = 0 WHERE attempt_id = ?',
            ['IN_PROGRESS', attempt.attempt_id]
        );
        await connection.query(
            'INSERT INTO exam_security_event (attempt_id, student_id, exam_id, event_type, details) VALUES (?, ?, ?, ?, ?)',
            [attempt.attempt_id, attempt.student_id, attempt.exam_id, 'admin_recovered', `Recovered by admin ${req.user.id}`]
        );

        await connection.commit();
        transactionStarted = false;
        res.status(200).json({
            success: true,
            message: 'Attempt recovered. Existing answers were preserved and the exam timer was restarted.',
            data: { attempt_id: attempt.attempt_id, status: 'IN_PROGRESS' }
        });
    } catch (error) {
        if (transactionStarted) await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

exports.getAdminEvents = async (req, res, next) => {
    try {
        const [events] = await pool.query(`
            SELECT security_event.event_id, security_event.attempt_id, security_event.student_id,
                   COALESCE(attempt.candidate_name, student.name) AS student_name,
                   attempt.candidate_prn, security_event.exam_id, exam.exam_name,
                   security_event.event_type, security_event.details, security_event.occurred_at
            FROM exam_security_event AS security_event
            JOIN attempt ON attempt.attempt_id = security_event.attempt_id
            JOIN student ON student.student_id = security_event.student_id
            JOIN exam ON exam.exam_id = security_event.exam_id
            ORDER BY security_event.occurred_at DESC
            LIMIT 500
        `);
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        next(error);
    }
};

exports.getAdminSettings = async (req, res, next) => {
    try {
        const [settings] = await pool.query(`
            SELECT exam.exam_id, exam.exam_name,
                   COALESCE(security.violation_limit, 3) AS violation_limit,
                   COALESCE(security.auto_submit, 0) AS auto_submit
            FROM exam
            LEFT JOIN exam_security_settings AS security ON security.exam_id = exam.exam_id
            ORDER BY exam.exam_name
        `);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

exports.updateAdminSettings = async (req, res, next) => {
    try {
        const examId = req.params.examId;
        const { violationLimit, autoSubmit } = req.body;
        if (!Number.isInteger(violationLimit) || violationLimit < 1 || violationLimit > 100 ||
            typeof autoSubmit !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Provide a violationLimit from 1 to 100 and a boolean autoSubmit value'
            });
        }

        const [exams] = await pool.query('SELECT exam_id FROM exam WHERE exam_id = ?', [examId]);
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        const [existing] = await pool.query(
            'SELECT exam_id FROM exam_security_settings WHERE exam_id = ?',
            [examId]
        );
        if (existing.length > 0) {
            await pool.query(
                'UPDATE exam_security_settings SET violation_limit = ?, auto_submit = ? WHERE exam_id = ?',
                [violationLimit, autoSubmit ? 1 : 0, examId]
            );
        } else {
            await pool.query(
                'INSERT INTO exam_security_settings (exam_id, violation_limit, auto_submit) VALUES (?, ?, ?)',
                [examId, violationLimit, autoSubmit ? 1 : 0]
            );
        }

        res.status(200).json({
            success: true,
            data: { exam_id: Number(examId), violation_limit: violationLimit, auto_submit: autoSubmit }
        });
    } catch (error) {
        next(error);
    }
};
