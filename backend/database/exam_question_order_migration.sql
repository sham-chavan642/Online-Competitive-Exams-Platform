USE online_exam_system;

ALTER TABLE attempt
    ADD COLUMN question_order TEXT NULL;
