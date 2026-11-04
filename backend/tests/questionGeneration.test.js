const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Syllabus-based question generation', () => {
  let adminToken;
  let originalApiKey;
  let originalModel;
  let originalFetch;

  beforeAll(async () => {
    const login = await request(app).post('/api/auth/admin/login').send({
      email: 'admin1@example.com',
      password: 'password123',
    });
    expect(login.statusCode).toBe(200);
    adminToken = login.body.token;
    originalApiKey = process.env.GROQ_API_KEY;
    originalModel = process.env.GROQ_MODEL;
    originalFetch = global.fetch;
  });

  afterAll(async () => {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = originalModel;
    global.fetch = originalFetch;
    await pool.end();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns reviewable questions without saving them to the question bank', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    process.env.GROQ_MODEL = 'test-model';
    const generated = {
      questions: [
        {
          question_text: 'Which layer routes packets between networks?',
          options: ['Network', 'Presentation', 'Session', 'Application'],
          correct_option_index: 0,
          marks: 2,
        },
        {
          question_text: 'What identifies a device on an IP network?',
          options: ['IP address', 'File name', 'Page title', 'User password'],
          correct_option_index: 0,
          marks: 1,
        },
      ],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(generated) } }],
      }),
    });
    const [before] = await pool.query('SELECT COUNT(*) AS count FROM question WHERE exam_id = ?', [4]);

    const response = await request(app)
      .post('/api/admin/questions/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        exam_id: 4,
        source_text: 'The network layer routes packets between networks. IP addresses identify devices on an IP network.',
        count: 2,
        difficulty: 'mixed',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.questions).toHaveLength(2);
    expect(response.body.data.questions[0].options.filter((option) => option.is_correct)).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [endpoint, requestOptions] = global.fetch.mock.calls[0];
    expect(endpoint).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(requestOptions.headers.Authorization).toBe('Bearer test-key');
    const requestBody = JSON.parse(requestOptions.body);
    expect(requestBody.model).toBe('test-model');
    expect(requestBody.messages[0].content).toContain('The network layer routes packets');
    expect(requestBody.response_format.json_schema.strict).toBe(true);

    const [after] = await pool.query('SELECT COUNT(*) AS count FROM question WHERE exam_id = ?', [4]);
    expect(after.count).toBe(before.count);
  });

  it('rejects invalid input and reports a missing server-side API key', async () => {
    delete process.env.GROQ_API_KEY;
    global.fetch = jest.fn();
    const invalid = await request(app)
      .post('/api/admin/questions/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ exam_id: 4, source_text: 'too short', count: 2, difficulty: 'mixed' });
    expect(invalid.statusCode).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();

    const missingKey = await request(app)
      .post('/api/admin/questions/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        exam_id: 4,
        source_text: 'This syllabus material is sufficiently long for a valid generation request.',
        count: 2,
        difficulty: 'mixed',
      });
    expect(missingKey.statusCode).toBe(503);
    expect(missingKey.body.message).toContain('GROQ_API_KEY');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns a clear gateway-timeout message when Groq does not respond', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(
      Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' })
    );

    const response = await request(app)
      .post('/api/admin/questions/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        exam_id: 4,
        source_text: 'This syllabus material is sufficiently long for a valid generation request.',
        count: 1,
        difficulty: 'easy',
      });

    expect(response.statusCode).toBe(504);
    expect(response.body.message).toContain('Groq question generation timed out');
    expect(response.body.message).not.toContain('test-key');
  });

  it('explains when Groq is rate-limited', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });

    const response = await request(app)
      .post('/api/admin/questions/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        exam_id: 4,
        source_text: 'This syllabus material is sufficiently long for a valid generation request.',
        count: 1,
        difficulty: 'easy',
      });

    expect(response.statusCode).toBe(503);
    expect(response.body.message).toContain('rate-limited');
    expect(response.body.message).not.toContain('test-key');
  });
});
