// tests/unit/put.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('PUT /v1/fragments', () => {
  // User should not be able to get access to fragments without appropriate credentials
  test('cannot get fragment data if user does not have appropriate credentials', async () =>
    await request(app)
      .put('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .auth('random@email.com', 'password1')
      .expect(401));

  //only authenticated users can modify fragments
  test('unauthenticated requests are denied', async () =>
    await request(app).put('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698').expect(401));

  test('attempt to update fragment that does not exist will fail', async () => {
    await request(app)
      .put('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('updating it')
      .expect(404);
  });

  test('attempt to change content-type while updating fragment data will fail', async () => {
    const data = Buffer.from('hello');
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data)
      .expect(201);

    await request(app)
      .put(`/v1/fragments/${postReq.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send('updating it')
      .expect(400);
  });

  test("authenticated user can update fragment's current data with new data of the same content-type", async () => {
    const data = Buffer.from('hello');
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data)
      .expect(201);

    const res = await request(app)
      .put(`/v1/fragments/${postReq.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('updating it');

    expect(res.statusCode).toBe(200);

    // Get new fragment metadata and make sure that size of new fragment data is the size of updated data
    const fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(fragment.size).toEqual(11);
  });
});
