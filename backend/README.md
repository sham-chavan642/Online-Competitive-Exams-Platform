# Online Competitive Examination System - Backend API

This project provides a complete REST API backend for an Online Competitive Examination System, built using Node.js, Express.js, and MySQL.
 
## Features
- Role-based authentication (Admin and Student) using JWT.
- Exam management (CRUD operations on topics, exams, questions, and options).
- Student exam portal (view available exams, start exam, answer questions, submit exam).
- Automatic evaluation system to calculate marks and percentages on submission.
- Real-time exam status tracking (IN_PROGRESS, SUBMITTED).
- Result generation and dynamic ranking calculations using SQL window functions.
- Secure password storage with bcrypt.

## Architecture & Technologies
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database:** MySQL 8+ (raw parameterized SQL via `mysql2` driver; no ORMs)
- **Security:** `helmet` for HTTP headers, `cors` for cross-origin sharing, `bcrypt` for password hashing, and `jsonwebtoken` for stateless auth.

## Database Schema & ER Relationships
The system consists of the following entities: `admin`, `student`, `topic`, `exam`, `question`, `question_option`, `attempt`, `answer`, and `result`.
- **Admin** manages **Exams** and **Topics**.
- **Exam** belongs to a **Topic** and contains multiple **Questions**.
- **Question** contains multiple **Question Options**.
- **Student** can make **Attempts** on **Exams**.
- **Attempt** records the student's progress and contains multiple **Answers** to the Exam's Questions.
- **Attempt** maps 1-to-1 to a final **Result**.

## Installation

1. **Clone the repository and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **MySQL Setup:**
   Ensure MySQL is running on your machine.
   Load the schema and seed data into your MySQL database:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
   For an existing database, apply the exam security tables without recreating
   the existing schema:
   ```bash
   mysql -u root -p < database/exam_security_migration.sql
   mysql -u root -p < database/exam_security_recovery_migration.sql
   mysql -u root -p < database/exam_duration_migration.sql
   mysql -u root -p < database/exam_question_order_migration.sql
   mysql -u root -p < database/exam_candidate_details_migration.sql
   ```

3. **Environment Variables:**
   From the `backend` directory, copy the root example environment file and update it with your credentials:
   ```bash
   cp ../.env.example .env
   ```
   *Edit `.env` to match your MySQL credentials.*
   To enable syllabus-based question generation, add your Groq API key to
   `backend/.env` (never place it in frontend files or send it in a browser request):
   ```env
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=openai/gpt-oss-20b
   ```
   The question-generation feature sends the syllabus text entered by an admin to
   the Groq API. Generated questions are only previews and are not saved to the
   question bank until an admin reviews and saves each one.

## Running the Server

Start the server in development mode using nodemon:
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

## API Documentation

Test these endpoints using Postman or Thunder Client.

### Authentication
- `POST /api/auth/student/register` - Register a new student
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login

### Admin Flow (requires Admin JWT)
- `GET /api/admin/dashboard` - Get overall system statistics
- `POST /api/topics` - Create a topic
- `POST /api/exams` - Create an exam under a topic
- `POST /api/questions` - Add a question (with its options) to an exam
- `GET /api/admin/students` - View all registered students
- `GET /api/admin/attempts` - View all exam attempts
- `GET /api/admin/results` - View all evaluation results
- `GET /api/results/exam/:examId` - View all results for a specific exam
- `GET /api/ranking/exam/:examId` - View ranking for a specific exam

### Student Flow (requires Student JWT)
- `GET /api/student/exams` - View all currently active exams available for the student
- `POST /api/student/exams/:examId/start` - Start an exam
- `POST /api/student/attempts/:attemptId/answer` - Submit an answer to a question
- `POST /api/student/attempts/:attemptId/submit` - Finish the exam and trigger evaluation
- `GET /api/results/my-results` - View all past results of the logged-in student

### Testing Instructions
Sample users are seeded in the database:
- **Admin**: `admin1@example.com` / `password123`
- **Student**: `student1@example.com` / `password123`

To test the complete flow:
1. Hit `GET /api/health` to verify server/database connectivity.
2. Login as a student to receive a JWT.
3. Pass the JWT in the `Authorization: Bearer <token>` header for subsequent requests.
4. Call `GET /api/student/exams` to find an exam ID.
5. `POST /api/student/exams/:examId/start` to begin.
6. Provide answers to questions using the generated `attempt_id`.
7. Submit the exam. The backend will evaluate and calculate your score.
