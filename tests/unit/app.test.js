// tests/unit/app.test.js

const request = require('supertest');

// Get our Express app object
const app = require('../../src/app');

describe('testing 404 middleware', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/undefined');
    expect(res.statusCode).toBe(404);
  });
});
