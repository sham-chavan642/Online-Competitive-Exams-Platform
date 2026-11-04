const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Exam security features', () => {
  let studentToken;
  let secondStudentToken;
  let adminToken;

  beforeAll(async () => {
    const [studentLogin, secondStudentLogin, adminLogin] = await Promise.all([
      request(app).post('/api/auth/student/login').send({
        email: 'student1@example.com',
        password: 'password123',
      }),
      request(app).post('/api/auth/student/login').send({
        email: 'student2@example.com',
        password: 'password123',
      }),
      request(app).post('/api/auth/admin/login').send({
        email: 'admin1@example.com',
        password: 'password123',
      }),
    ]);

    expect(studentLogin.statusCode).toBe(200);
    expect(secondStudentLogin.statusCode).toBe(200);
    expect(adminLogin.statusCode).toBe(200);
    studentToken = studentLogin.body.token;
    secondStudentToken = secondStudentLogin.body.token;
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('records events, preserves manual submission/results, and supports configured auto-submit', async () => {
    const examResponse = await request(app)
      .get('/api/exams/4')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(examResponse.statusCode).toBe(200);
    const exam = examResponse.body.data;
    const durationUpdate = await request(app)
      .put('/api/exams/4')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        topic_id: exam.topic_id,
        exam_name: exam.exam_name,
        description: exam.description,
        duration: 75,
        total_marks: exam.total_marks,
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    expect(durationUpdate.statusCode).toBe(200);
    const updatedExamResponse = await request(app)
      .get('/api/exams/4')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(updatedExamResponse.body.data.duration).toBe(75);
    await request(app)
      .put('/api/exams/4')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        topic_id: exam.topic_id,
        exam_name: exam.exam_name,
        description: exam.description,
        duration: exam.duration,
        total_marks: exam.total_marks,
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    const shortDurationResponse = await request(app)
      .put('/api/exams/4')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        topic_id: exam.topic_id,
        exam_name: exam.exam_name,
        description: exam.description,
        duration: 45,
        total_marks: exam.total_marks,
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    expect(shortDurationResponse.statusCode).toBe(400);
    expect(shortDurationResponse.body.message).toBe('Exam duration must be at least 60 minutes');

    const settingResponse = await request(app)
      .put('/api/admin/security/settings/2')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ violationLimit: 1, autoSubmit: true });
    expect(settingResponse.statusCode).toBe(200);

    const missingIdentityResponse = await request(app)
      .post('/api/student/exams/3/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ candidate_name: ' ', candidate_prn: '' });
    expect(missingIdentityResponse.statusCode).toBe(400);

    const startResponse = await request(app)
      .post('/api/student/exams/3/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ candidate_name: 'Exam Candidate One', candidate_prn: 'PRN-3001' });
    expect(startResponse.statusCode).toBe(201);
    const attemptId = startResponse.body.data.attempt_id;
    const question = startResponse.body.data.exam.questions[0];

    const attemptResponse = await request(app)
      .get(`/api/student/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(attemptResponse.statusCode).toBe(200);
    expect(attemptResponse.body.data.exam.questions).toHaveLength(4);
    expect(attemptResponse.body.data.attempt).toMatchObject({
      candidate_name: 'Exam Candidate One',
      candidate_prn: 'PRN-3001',
    });
    const examDurationSeconds = Number(attemptResponse.body.data.exam.duration) * 60;
    expect(attemptResponse.body.data.attempt.remaining_seconds).toBeGreaterThan(examDurationSeconds - 50);
    expect(attemptResponse.body.data.attempt.remaining_seconds).toBeLessThanOrEqual(examDurationSeconds);

    const answerResponse = await request(app)
      .post(`/api/student/attempts/${attemptId}/answer`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ questionId: question.question_id, selectedOptionId: question.options[0].option_id });
    expect(answerResponse.statusCode).toBe(200);

    const eventResponse = await request(app)
      .post(`/api/student/security/attempts/${attemptId}/events`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventType: 'tab_hidden' });
    expect(eventResponse.statusCode).toBe(201);
    expect(eventResponse.body.data.violation_count).toBe(1);
    expect(eventResponse.body.data.auto_submitted).toBe(false);

    const adminEvents = await request(app)
      .get('/api/admin/security/events')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminEvents.statusCode).toBe(200);
    expect(adminEvents.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attempt_id: attemptId,
        student_name: 'Exam Candidate One',
        candidate_prn: 'PRN-3001',
        event_type: 'tab_hidden',
      }),
    ]));

    const adminAttempts = await request(app)
      .get('/api/admin/attempts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminAttempts.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attempt_id: attemptId,
        candidate_name: 'Exam Candidate One',
        candidate_prn: 'PRN-3001',
      }),
    ]));

    const submitResponse = await request(app)
      .post(`/api/student/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(submitResponse.statusCode).toBe(200);
    expect(submitResponse.body.data).toHaveProperty('score');

    const resultsResponse = await request(app)
      .get('/api/results/my-results')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(resultsResponse.statusCode).toBe(200);
    expect(resultsResponse.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ attempt_id: attemptId, exam_id: 3 }),
    ]));
    const adminResults = await request(app)
      .get('/api/admin/results')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminResults.statusCode).toBe(200);
    expect(adminResults.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attempt_id: attemptId,
        student_name: 'Exam Candidate One',
        candidate_prn: 'PRN-3001',
      }),
    ]));
    for (let index = 1; index < adminResults.body.data.length; index += 1) {
      const previous = adminResults.body.data[index - 1];
      const current = adminResults.body.data[index];
      if (previous.exam_name === current.exam_name) {
        expect(Number(previous.score)).toBeGreaterThanOrEqual(Number(current.score));
      } else {
        expect(previous.exam_name.localeCompare(current.exam_name)).toBeLessThanOrEqual(0);
      }
    }

    const secondStartResponse = await request(app)
      .post('/api/student/exams/2/start')
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({ candidate_name: 'Exam Candidate Two', candidate_prn: 'PRN-2002' });
    expect(secondStartResponse.statusCode).toBe(201);
    const secondAttemptId = secondStartResponse.body.data.attempt_id;
    const secondQuestion = secondStartResponse.body.data.exam.questions[0];
    const savedAnswerResponse = await request(app)
      .post(`/api/student/attempts/${secondAttemptId}/answer`)
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({
        questionId: secondQuestion.question_id,
        selectedOptionId: secondQuestion.options[0].option_id,
      });
    expect(savedAnswerResponse.statusCode).toBe(200);

    const autoSubmitResponse = await request(app)
      .post(`/api/student/security/attempts/${secondAttemptId}/events`)
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({ eventType: 'fullscreen_exit' });
    expect(autoSubmitResponse.statusCode).toBe(201);
    expect(autoSubmitResponse.body.data).toMatchObject({
      violation_count: 1,
      violation_limit: 1,
      auto_submitted: true,
    });

    const secondResultsResponse = await request(app)
      .get('/api/results/my-results')
      .set('Authorization', `Bearer ${secondStudentToken}`);
    expect(secondResultsResponse.statusCode).toBe(200);
    expect(secondResultsResponse.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ attempt_id: secondAttemptId, exam_id: 2 }),
    ]));

    const recoveredResponse = await request(app)
      .post(`/api/admin/attempts/${secondAttemptId}/recover`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(recoveredResponse.statusCode).toBe(200);
    expect(recoveredResponse.body.data.status).toBe('IN_PROGRESS');

    const recoveredAttempt = await request(app)
      .get(`/api/student/attempts/${secondAttemptId}`)
      .set('Authorization', `Bearer ${secondStudentToken}`);
    expect(recoveredAttempt.statusCode).toBe(200);
    expect(recoveredAttempt.body.data.attempt.status).toBe('IN_PROGRESS');
    expect(recoveredAttempt.body.data.attempt.auto_submitted).toBe(0);
    expect(recoveredAttempt.body.data.answers).toEqual([
      expect.objectContaining({
        question_id: secondQuestion.question_id,
        option_id: secondQuestion.options[0].option_id,
      }),
    ]);
    const resetViolations = await request(app)
      .get(`/api/student/security/attempts/${secondAttemptId}/settings`)
      .set('Authorization', `Bearer ${secondStudentToken}`);
    expect(resetViolations.body.data.violation_count).toBe(0);

    const liveParticipants = await request(app)
      .get('/api/admin/attempts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(liveParticipants.statusCode).toBe(200);
    expect(liveParticipants.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attempt_id: secondAttemptId,
        student_name: 'Student Two',
        exam_name: 'DBMS Advanced',
        status: 'IN_PROGRESS',
        exam_duration: 90,
      }),
    ]));

    const recoverEvents = await request(app)
      .get('/api/admin/security/events')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(recoverEvents.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attempt_id: secondAttemptId,
        event_type: 'admin_recovered',
      }),
    ]));
  });

  it('keeps a randomized question sequence stable for each attempt', async () => {
    const startResponse = await request(app)
      .post('/api/student/exams/5/start')
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({ candidate_name: 'Candidate Five', candidate_prn: 'PRN-5005' });

    expect(startResponse.statusCode).toBe(201);
    const attemptId = startResponse.body.data.attempt_id;
    const startedQuestionIds = startResponse.body.data.exam.questions.map((question) => question.question_id);
    expect(new Set(startedQuestionIds).size).toBe(startedQuestionIds.length);

    const attemptResponse = await request(app)
      .get(`/api/student/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${secondStudentToken}`);
    expect(attemptResponse.statusCode).toBe(200);
    expect(attemptResponse.body.data.exam.questions.map((question) => question.question_id)).toEqual(startedQuestionIds);

    const [storedAttempts] = await pool.query(
      'SELECT question_order FROM attempt WHERE attempt_id = ?',
      [attemptId]
    );
    expect(JSON.parse(storedAttempts[0].question_order)).toEqual(startedQuestionIds);
  });
});
