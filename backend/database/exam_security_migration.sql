USE online_exam_system;

CREATE TABLE IF NOT EXISTS exam_security_settings (
    exam_id INT PRIMARY KEY,
    violation_limit INT NOT NULL DEFAULT 3,
    auto_submit BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_security_event (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    details VARCHAR(255) NULL,
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exam_security_attempt (attempt_id, occurred_at),
    INDEX idx_exam_security_recent (occurred_at),
    FOREIGN KEY (attempt_id) REFERENCES attempt(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE
);
