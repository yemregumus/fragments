// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('resources that cant be found cant be found', () =>
    request(app).get('/non-existent-route').expect(404));

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
