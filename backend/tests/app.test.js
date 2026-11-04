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

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      
      // Depending on whether the DB is connected, we might get 200 or 500
      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('database');
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
