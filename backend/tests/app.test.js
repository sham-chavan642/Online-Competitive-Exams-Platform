const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('App Endpoints', () => {
  // Close database connection after all tests to prevent Jest from hanging
  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns a healthy status when the database is connected', async () => {
      jest.spyOn(pool, 'query').mockResolvedValue([]);

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Server is healthy',
        database: 'connected'
      });
    });

    it('returns a disconnected status when the database query fails', async () => {
      jest.spyOn(pool, 'query').mockRejectedValue(new Error('database unavailable'));

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Server is running but database is disconnected',
        database: 'disconnected',
        error: 'database unavailable'
      });
    });
  });

  describe('404 Route', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown-route');
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Route not found');
    });
  });
});
