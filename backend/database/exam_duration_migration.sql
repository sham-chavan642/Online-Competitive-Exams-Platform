USE online_exam_system;

UPDATE exam
SET duration = 60
WHERE duration < 60;
