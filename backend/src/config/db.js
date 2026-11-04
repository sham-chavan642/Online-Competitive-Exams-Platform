const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let pool;
let databaseDialect = 'sqlite';

// Use MySQL whenever database connection details are configured. Local MySQL
// (localhost/127.0.0.1) is a valid persistent development database too.
const hasMySQLConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);

if (hasMySQLConfig) {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'online_exam_system',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        databaseDialect = 'mysql';
        console.log('Configured MySQL connection pool');
    } catch (err) {
        console.warn('MySQL initialization failed, falling back to in-memory database:', err.message);
        pool = null;
    }
}

if (!pool) {
    console.log('[AI Studio] Initializing in-memory SQLite database pre-seeded with sample exams & users...');
    const { DatabaseSync } = require('node:sqlite');
    const sqliteDb = new DatabaseSync(':memory:');

    // Register NOW() function
    // Keep NOW() in ISO-like format so it compares correctly with ISO timestamps
    // sent by the frontend (new Date(...).toISOString()).
    sqliteDb.function('NOW', () => new Date().toISOString().slice(0, 19));

    // Create tables
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS admin (
            admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS student (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            gender TEXT,
            phone TEXT
        );
        CREATE TABLE IF NOT EXISTS topic (
            topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_name TEXT NOT NULL,
            description TEXT
        );
        CREATE TABLE IF NOT EXISTS exam (
            exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            topic_id INTEGER NOT NULL,
            exam_name TEXT NOT NULL,
            description TEXT,
            duration INTEGER NOT NULL,
            total_marks INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            require_candidate_details INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS question (
            question_id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT NOT NULL DEFAULT 'MCQ',
            marks INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS question_option (
            option_id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            option_text TEXT NOT NULL,
            is_correct INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS attempt (
            attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            exam_id INTEGER NOT NULL,
            started_at TEXT NOT NULL DEFAULT (datetime('now')),
            submitted_at TEXT,
            status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
            score INTEGER DEFAULT NULL,
            auto_submitted INTEGER NOT NULL DEFAULT 0,
            question_order TEXT,
            candidate_name TEXT,
            candidate_prn TEXT,
            UNIQUE (student_id, exam_id)
        );
        CREATE TABLE IF NOT EXISTS answer (
            answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            attempt_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            option_id INTEGER NOT NULL,
            answered_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE (attempt_id, question_id)
        );
        CREATE TABLE IF NOT EXISTS result (
            result_id INTEGER PRIMARY KEY AUTOINCREMENT,
            attempt_id INTEGER NOT NULL UNIQUE,
            student_id INTEGER NOT NULL,
            exam_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            percentage REAL NOT NULL,
            result_status TEXT NOT NULL,
            generated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS exam_security_settings (
            exam_id INTEGER PRIMARY KEY,
            violation_limit INTEGER NOT NULL DEFAULT 3,
            auto_submit INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS exam_security_event (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            attempt_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            exam_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            details TEXT,
            occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Load seed data
    try {
        const seedPath = path.resolve(__dirname, '../../database/seed.sql');
        if (fs.existsSync(seedPath)) {
            let seed = fs.readFileSync(seedPath, 'utf8');
            seed = seed.replace(/USE online_exam_system;/g, '');
            seed = seed.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");
            seed = seed.replace(/TRUE/gi, '1').replace(/FALSE/gi, '0');
            sqliteDb.exec(seed);
            console.log('[AI Studio] SQLite seeded successfully with exams and credentials');
        }
    } catch (err) {
        console.warn('Failed to seed SQLite:', err.message);
    }

    const runQuery = (sql, params = []) => {
        let cleaned = sql.trim().replace(/;\s*$/, '');
        cleaned = cleaned.replace(/\s+FOR\s+UPDATE\b/gi, '');
        cleaned = cleaned.replace(/=\s*"([^"]+)"/g, "='$1'");
        if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(cleaned)) {
            cleaned = cleaned.replace(
                /ON\s+DUPLICATE\s+KEY\s+UPDATE.*$/is,
                "ON CONFLICT(attempt_id, question_id) DO UPDATE SET option_id = excluded.option_id, answered_at = datetime('now')"
            );
        }

        const isSelect = /^\s*(SELECT|PRAGMA)/i.test(cleaned);
        const stmt = sqliteDb.prepare(cleaned);

        if (isSelect) {
            const rows = stmt.all(...params);
            return [rows, []];
        } else {
            const info = stmt.run(...params);
            return [{
                insertId: Number(info.lastInsertRowid),
                affectedRows: info.changes
            }, []];
        }
    };

    pool = {
        query: async (sql, params = []) => {
            return runQuery(sql, params);
        },
        getConnection: async () => {
            return {
                query: async (sql, params = []) => runQuery(sql, params),
                beginTransaction: async () => {
                    sqliteDb.exec('BEGIN');
                },
                commit: async () => {
                    sqliteDb.exec('COMMIT');
                },
                rollback: async () => {
                    try {
                        sqliteDb.exec('ROLLBACK');
                    } catch (_) {}
                },
                release: () => {}
            };
        },
        end: async () => {}
    };
}

pool.databaseDialect = databaseDialect;

module.exports = pool;
