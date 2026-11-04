# Competitive Examination System - Database Schema Explanation

This document explains the SQL database design for the Competitive Examination System. The database is structured in a highly relational way to handle everything from user management to exam creation, answering, and evaluation.

The system relies on **9 main tables**, which can be logically grouped into four categories:

---

### 1. User Management Tables
These tables store the credentials and details for the people using the system.
* **`admin`**: Stores administrators who create and manage exams.
  * Fields include basic information like `admin_id`, `name`, `email`, and a securely hashed `password`.
* **`student`**: Stores the students taking the exams. 
  * Similar to `admin`, it has an auto-incrementing `student_id`, `email` (must be unique), `password`, along with optional `gender` and `phone`.

### 2. Exam Creation & Structure Tables
These tables form the blueprint of the exams created by the admins.
* **`topic`**: Represents a broad category or subject (e.g., "Data Structures", "Networking"). It acts as an umbrella for exams.
* **`exam`**: This is the core exam definition. 
  * **Foreign Keys**: It references `admin_id` (who created it) and `topic_id` (what subject it belongs to).
  * **Timing & Scoring**: It defines how long the exam lasts (`duration`), its `total_marks`, and the exact window it is available (`start_time` to `end_time`).
* **`question`**: Stores the actual questions that belong to a specific exam.
  * Links to the `exam_id`.
  * Includes the `question_text`, the `question_type` (defaulting to MCQ), and how many `marks` this specific question is worth.
* **`question_option`**: Represents the multiple-choice options for a given question.
  * Links to `question_id`.
  * Includes the `option_text`.
  * The **crucial field** here is `is_correct` (a Boolean). The backend uses this field during evaluation to check if the student chose the right answer, ensuring the frontend never knows the correct answer beforehand.

### 3. Student Examination Flow (Active State)
When a student starts an exam, these tables track their live progress.
* **`attempt`**: A record is created the exact moment a student clicks "Start Exam".
  * It maps a `student_id` to an `exam_id`.
  * **Unique Constraint**: It has a `UNIQUE (student_id, exam_id)` constraint, strictly enforcing that a student can only attempt a specific exam **once**.
  * **Tracking**: It tracks when they started (`started_at`), when they finished (`submitted_at`), and their live status (`status` defaults to `IN_PROGRESS`, later turning into `SUBMITTED`).
* **`answer`**: Stores the exact options the student is clicking during an active attempt.
  * It links the `attempt_id`, the `question_id`, and the `option_id` the student selected.
  * **Unique Constraint**: It features a `UNIQUE (attempt_id, question_id)` constraint. If a student changes their mind and selects a different option for a question, this constraint ensures the backend safely overwrites their old answer instead of inserting a duplicate row.

### 4. Final Evaluation Table
Once an attempt is submitted, the backend calculates the final score and stores it here.
* **`result`**: The permanent record of the student's performance.
  * It links to the completed `attempt_id`, `student_id`, and `exam_id`.
  * Stores the final calculated `score`, the exact `percentage`, and a `result_status` (like 'PASS' or 'FAIL').
  * The `attempt_id` is marked `UNIQUE` here, enforcing a strict 1-to-1 relationship between a finished attempt and a final result.

---

### Key Architectural Highlights:
* **Cascading Deletes (`ON DELETE CASCADE`)**: Across the entire schema, if a parent record is deleted (e.g., an `exam`), all child records (its questions, options, attempts, answers, and results) are automatically deleted by the database to prevent orphaned data.
* **Data Integrity**: Everything from "one attempt per student per exam" to "one answer per question per attempt" is enforced strictly at the **Database level** using `UNIQUE` constraints, so bad data can never accidentally enter the system even if there's a bug in the code.
