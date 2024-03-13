// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // If user doesn't have any fragments, the returned array will be empty
  test('for users without fragments empty array is returned', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toHaveLength(0);
  });

  // If user has fragments, the returned array length will be equal to the number of fragments user has
  test('for users with saved fragments, fragments length matches the amount of fragments', async () => {
    const fragments = ['Hello', 'World'];
    for (const fragment in fragments) {
      await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(fragment)
        .auth('user1@email.com', 'password1');
    }
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toHaveLength(2);
  });

  // Ensure that we are receiving just ids and nothing else
  test('GET request without expand option will only return ids', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments[0]).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
  });
});

describe('GET /v1/fragments?expand=1', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments?expand=1').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments?expand=1')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user2@email.com', 'password2');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // If user doesn't have any fragments, the returned array will be empty
  test('for users without fragments empty array is returned', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user2@email.com', 'password2');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toHaveLength(0);
  });

  // If user has fragments, the returned array length will be equal to the number of fragments user has
  test('for users with saved fragments, fragments length matches the amount of fragments', async () => {
    const fragments = ['Hello', 'World'];
    for (const fragment in fragments) {
      await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(fragment)
        .auth('user2@email.com', 'password2');
    }
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user2@email.com', 'password2');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toHaveLength(2);
  });

  // Ensure that we are receiving an array of all of metadata and not just ids
  test('GET request with expand option will return full metadata of fragments', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user2@email.com', 'password2');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments[0]).toHaveProperty('id');
    expect(res.body.fragments[0].id).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
    expect(res.body.fragments[0]).toHaveProperty('created');
    expect(res.body.fragments[0]).toHaveProperty('updated');
    expect(res.body.fragments[0]).toHaveProperty('ownerId');
    expect(res.body.fragments[0]).toHaveProperty('type');
    expect(res.body.fragments[0].type).toBe('text/plain');
    expect(res.body.fragments[0]).toHaveProperty('size');
  });
});
