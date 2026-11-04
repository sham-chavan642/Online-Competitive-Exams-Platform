USE online_exam_system;

ALTER TABLE attempt
    ADD COLUMN auto_submitted BOOLEAN NOT NULL DEFAULT FALSE;
