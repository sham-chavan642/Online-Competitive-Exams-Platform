USE online_exam_system;

-- Passwords are hashed versions of 'password123'
-- using bcrypt. Default salt rounds = 10
-- $2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG

INSERT INTO admin (name, email, password) VALUES
('Admin One', 'admin1@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG'),
('Admin Two', 'admin2@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG');

INSERT INTO student (name, email, password, gender, phone) VALUES
('Student One', 'student1@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG', 'Male', '1111111111'),
('Student Two', 'student2@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG', 'Female', '2222222222'),
('Student Three', 'student3@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG', 'Male', '3333333333'),
('Student Four', 'student4@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG', 'Female', '4444444444'),
('Student Five', 'student5@example.com', '$2a$10$5uzhz.zNA.eTEH.ZnNNv2uCfJlcMR3j3m9j87uwga5zE.5W.w.3ZG', 'Male', '5555555555');

INSERT INTO topic (topic_name, description) VALUES
('Data Structures', 'Basic Data Structures and Algorithms'),
('Database Management System', 'SQL and NoSQL Databases'),
('Operating Systems', 'OS concepts like Process Management, Memory Management'),
('Computer Networks', 'OSI Model, TCP/IP, Routing'),
('Software Engineering', 'SDLC, Agile, Testing');

INSERT INTO exam (admin_id, topic_id, exam_name, description, duration, total_marks, start_time, end_time) VALUES
(1, 1, 'DSA Basics', 'Test your basic DSA knowledge', 60, 10, '2023-01-01 10:00:00', '2030-12-31 11:00:00'),
(1, 2, 'DBMS Advanced', 'Advanced SQL Queries', 90, 10, '2023-01-01 10:00:00', '2030-12-31 11:30:00'),
(2, 3, 'OS Midterm', 'Midterm examination for OS', 120, 10, '2023-01-01 10:00:00', '2030-12-31 12:00:00'),
(2, 4, 'Networking Basics', 'Basic Networking concepts', 60, 10, '2023-01-01 10:00:00', '2030-12-31 10:45:00'),
(1, 5, 'Software Testing', 'Software Testing methodologies', 60, 10, '2023-01-01 10:00:00', '2030-12-31 11:00:00');

-- Let's insert 4 questions for exam 1
INSERT INTO question (exam_id, question_text, question_type, marks) VALUES
(1, 'Which data structure uses LIFO?', 'MCQ', 2),
(1, 'Which data structure uses FIFO?', 'MCQ', 2),
(1, 'What is the worst-case time complexity of Quick Sort?', 'MCQ', 3),
(1, 'Which of the following is a non-linear data structure?', 'MCQ', 3);

-- Options for Question 1
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(1, 'Queue', FALSE), (1, 'Stack', TRUE), (1, 'Array', FALSE), (1, 'Linked List', FALSE);

-- Options for Question 2
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(2, 'Queue', TRUE), (2, 'Stack', FALSE), (2, 'Tree', FALSE), (2, 'Graph', FALSE);

-- Options for Question 3
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(3, 'O(n log n)', FALSE), (3, 'O(n)', FALSE), (3, 'O(n^2)', TRUE), (3, 'O(log n)', FALSE);

-- Options for Question 4
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(4, 'Array', FALSE), (4, 'Linked List', FALSE), (4, 'Stack', FALSE), (4, 'Tree', TRUE);

-- Insert 4 questions for exam 2
INSERT INTO question (exam_id, question_text, question_type, marks) VALUES
(2, 'Which of the following is not a DDL command?', 'MCQ', 2),
(2, 'What does ACID stand for?', 'MCQ', 3),
(2, 'Which normal form deals with multivalued dependencies?', 'MCQ', 3),
(2, 'Which join returns all rows from both tables?', 'MCQ', 2);

-- Options for Question 5
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(5, 'CREATE', FALSE), (5, 'DROP', FALSE), (5, 'ALTER', FALSE), (5, 'UPDATE', TRUE);

-- Options for Question 6
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(6, 'Atomicity, Consistency, Isolation, Durability', TRUE),
(6, 'Atomicity, Concurrency, Isolation, Durability', FALSE),
(6, 'Accuracy, Consistency, Isolation, Durability', FALSE),
(6, 'Atomicity, Consistency, Integrity, Durability', FALSE);

-- Options for Question 7
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(7, '1NF', FALSE), (7, '2NF', FALSE), (7, '3NF', FALSE), (7, '4NF', TRUE);

-- Options for Question 8
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(8, 'INNER JOIN', FALSE), (8, 'LEFT JOIN', FALSE), (8, 'RIGHT JOIN', FALSE), (8, 'FULL OUTER JOIN', TRUE);

-- Insert 4 questions for exam 3
INSERT INTO question (exam_id, question_text, question_type, marks) VALUES
(3, 'What is the core of the operating system?', 'MCQ', 2),
(3, 'Which scheduling algorithm is non-preemptive?', 'MCQ', 2),
(3, 'What is a deadlock?', 'MCQ', 3),
(3, 'Which memory allocation scheme is subject to external fragmentation?', 'MCQ', 3);

-- Options for Question 9
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(9, 'Shell', FALSE), (9, 'Kernel', TRUE), (9, 'Command Prompt', FALSE), (9, 'GUI', FALSE);

-- Options for Question 10
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(10, 'Round Robin', FALSE), (10, 'SRTF', FALSE), (10, 'FCFS', TRUE), (10, 'Priority Preemptive', FALSE);

-- Options for Question 11
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(11, 'A condition where processes are executing smoothly', FALSE),
(11, 'A condition where a set of processes are blocked', TRUE),
(11, 'A condition where OS crashes', FALSE),
(11, 'A condition where memory is full', FALSE);

-- Options for Question 12
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(12, 'Paging', FALSE), (12, 'Segmentation', FALSE), (12, 'Contiguous Allocation', TRUE), (12, 'Demand Paging', FALSE);

-- Insert 4 questions for exam 4
INSERT INTO question (exam_id, question_text, question_type, marks) VALUES
(4, 'How many layers are in the OSI model?', 'MCQ', 2),
(4, 'Which protocol is used for email transmission?', 'MCQ', 2),
(4, 'What does IP stand for?', 'MCQ', 3),
(4, 'Which layer is responsible for routing?', 'MCQ', 3);

-- Options for Question 13
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(13, '5', FALSE), (13, '6', FALSE), (13, '7', TRUE), (13, '8', FALSE);

-- Options for Question 14
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(14, 'FTP', FALSE), (14, 'HTTP', FALSE), (14, 'SMTP', TRUE), (14, 'SNMP', FALSE);

-- Options for Question 15
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(15, 'Internet Protocol', TRUE), (15, 'Internal Protocol', FALSE), (15, 'Intranet Protocol', FALSE), (15, 'International Protocol', FALSE);

-- Options for Question 16
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(16, 'Data Link Layer', FALSE), (16, 'Network Layer', TRUE), (16, 'Transport Layer', FALSE), (16, 'Application Layer', FALSE);

-- Insert 4 questions for exam 5
INSERT INTO question (exam_id, question_text, question_type, marks) VALUES
(5, 'Which model is not a Software Development Life Cycle model?', 'MCQ', 2),
(5, 'What is unit testing?', 'MCQ', 3),
(5, 'Which of the following is a black box testing technique?', 'MCQ', 2),
(5, 'What does SRS stand for?', 'MCQ', 3);

-- Options for Question 17
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(17, 'Waterfall', FALSE), (17, 'Spiral', FALSE), (17, 'Agile', FALSE), (17, 'Capability Maturity', TRUE);

-- Options for Question 18
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(18, 'Testing the whole system', FALSE), (18, 'Testing individual modules', TRUE), (18, 'Testing integration', FALSE), (18, 'User acceptance testing', FALSE);

-- Options for Question 19
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(19, 'Statement Coverage', FALSE), (19, 'Branch Coverage', FALSE), (19, 'Boundary Value Analysis', TRUE), (19, 'Path Coverage', FALSE);

-- Options for Question 20
INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(20, 'Software Requirement Specification', TRUE), (20, 'System Requirement Specification', FALSE), (20, 'Software Reliability Specification', FALSE), (20, 'System Reliability Specification', FALSE);


-- Sample Attempts
INSERT INTO attempt (student_id, exam_id, status, score, submitted_at) VALUES
(1, 1, 'SUBMITTED', 10, CURRENT_TIMESTAMP),
(2, 1, 'SUBMITTED', 5, CURRENT_TIMESTAMP);

-- Sample Answers
-- Student 1 answers all correctly
INSERT INTO answer (attempt_id, question_id, option_id) VALUES
(1, 1, 2),
(1, 2, 5),
(1, 3, 11),
(1, 4, 16);

-- Student 2 answers some correctly
INSERT INTO answer (attempt_id, question_id, option_id) VALUES
(2, 1, 2),
(2, 2, 6),
(2, 3, 11),
(2, 4, 15);

-- Sample Results
INSERT INTO result (attempt_id, student_id, exam_id, score, percentage, result_status) VALUES
(1, 1, 1, 10, 100.00, 'PASS'),
(2, 2, 1, 5, 50.00, 'FAIL');
