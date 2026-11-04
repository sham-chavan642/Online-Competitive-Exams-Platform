# Online Competitive Examination System - Frontend

## Project Overview
A complete, modern, and responsive React frontend for an Online Competitive Examination System. Built with React and Vite, it seamlessly integrates with a robust backend API to manage students, exams, topics, questions, and results.

## Features
- **Authentication**: JWT-based secure authentication for Students and Admins.
- **Student Portal**:
  - Dashboard with summary statistics.
  - View available and upcoming exams.
  - Active exam environment with live timer, question navigation, and real-time answer saving.
  - Result view and leaderboard ranking.
- **Admin Portal**:
  - Comprehensive dashboard.
  - CRUD operations for Topics, Exams, and Questions.
  - View Students, Attempts, and Results.
- **Design**: Premium, responsive UI built with vanilla CSS. Dark sidebar and professional cards.

## Technology Stack
- React.js (v18+)
- Vite
- React Router (v6)
- Axios
- Vanilla CSS
- Lucide React (Icons)
- JavaScript (No TypeScript)

## Folder Structure
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/
│   │   ├── auth/        # Login/Register pages
│   │   ├── student/     # Student portal pages
│   │   └── admin/       # Admin portal pages
│   ├── services/        # API configuration and service modules
│   ├── context/         # React Context (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utilities (localStorage)
│   ├── App.jsx          # App Router
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles and design system variables
├── .env.example
├── package.json
└── README.md
```

## Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup
Create a `.env` file in the root of the `frontend` folder using `.env.example` as a template:
```env
VITE_API_URL=http://localhost:5000/api
```

## Run Development Server
```bash
npm run dev
```

## Build for Production
```bash
npm run build
```

## Available Routes
### Student Flow
- `/login` → Student Login
- `/register` → Student Registration
- `/student/dashboard` → Student Dashboard
- `/student/exams` → View Available Exams
- `/student/exams/:id` → Exam Details
- `/student/exam/:attemptId` → Active Exam Session
- `/student/results` → All Results
- `/student/results/:id` → Specific Result Details
- `/student/ranking/:examId` → Exam Leaderboard

### Admin Flow
- `/admin/login` → Admin Login
- `/admin/dashboard` → Admin Dashboard
- `/admin/students` → Manage Students
- `/admin/topics` → Manage Topics
- `/admin/exams` → Manage Exams
- `/admin/questions` → Manage Questions
- `/admin/attempts` → View Attempts
- `/admin/results` → View Results
