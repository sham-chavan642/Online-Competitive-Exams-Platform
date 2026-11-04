USE online_exam_system;

ALTER TABLE exam
    ADD COLUMN require_candidate_details BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE attempt
    ADD COLUMN candidate_name VARCHAR(255) NULL,
    ADD COLUMN candidate_prn VARCHAR(100) NULL;
