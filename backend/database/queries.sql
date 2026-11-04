-- 1. All students.
SELECT * FROM student;

-- 2. All exams.
SELECT * FROM exam;

-- 3. Questions of an exam.
SELECT * FROM question WHERE exam_id = 1;

-- 4. Options of a question.
SELECT * FROM question_option WHERE question_id = 1;

-- 5. Students who attempted an exam.
SELECT s.student_id, s.name, a.status, a.score 
FROM student s
JOIN attempt a ON s.student_id = a.student_id
WHERE a.exam_id = 1;

-- 6. Student results.
SELECT r.result_id, e.exam_name, r.score, r.percentage, r.result_status
FROM result r
JOIN exam e ON r.exam_id = e.exam_id
WHERE r.student_id = 1;

-- 7. Exam ranking.
SELECT 
    RANK() OVER (ORDER BY score DESC, submitted_at ASC) as `rank`,
    s.student_id,
    s.name as student_name,
    a.score,
    (a.score / e.total_marks) * 100 as percentage
FROM attempt a
JOIN student s ON a.student_id = s.student_id
JOIN exam e ON a.exam_id = e.exam_id
WHERE a.exam_id = 1 AND a.status = 'SUBMITTED';

-- 8. Average score.
SELECT AVG(score) as average_score FROM attempt WHERE exam_id = 1 AND status = 'SUBMITTED';

-- 9. Highest score.
SELECT MAX(score) as highest_score FROM attempt WHERE exam_id = 1 AND status = 'SUBMITTED';

-- 10. Number of attempts per exam.
SELECT exam_id, COUNT(attempt_id) as attempt_count FROM attempt GROUP BY exam_id;

-- 11. Number of questions per exam.
SELECT exam_id, COUNT(question_id) as question_count FROM question GROUP BY exam_id;

-- 12. Topic-wise exam count.
SELECT t.topic_name, COUNT(e.exam_id) as exam_count
FROM topic t
LEFT JOIN exam e ON t.topic_id = e.topic_id
GROUP BY t.topic_id;
