// tests/unit/delete.test.js
const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');

describe('DELETE /v1/fragments', () => {
  test('unauthenticated delete requests are denied', async () => {
    const res = await request(app).delete('/v1/fragments/somefragment');
    expect(res.status).toBe(401);
  });

  test('users with invalid credentials cannot delete a fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/somefragment')
      .auth('random@email.com', 'password1');
    expect(res.status).toBe(401);
  });

  test('authenticated users can delete fragment', async () => {
    // First posting a fragment that will be deleted later in the test
    const data = Buffer.from('hello');
    const postReq = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');

    // Check if posting the fragment was successful
    expect(postReq.statusCode).toBe(201);
    expect(postReq.body.status).toBe('ok');

    // Log the fragment ID for debugging purposes
    logger.debug(`Fragment created with ID: ${postReq.body.fragment.id}`);

    // Delete the newly created fragment
    const res = await request(app)
      .delete(`/v1/fragments/${postReq.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    // Check if deletion was successful
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    // Log a success message after deletion
    logger.debug(`Fragment with ID ${postReq.body.fragment.id} deleted successfully`);
  });

  test('Attempt to delete a fragment that does not exist will throw', async () => {
    const res = await request(app)
      .delete('/v1/fragments/somefragment')
      .auth('user1@email.com', 'password1');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
