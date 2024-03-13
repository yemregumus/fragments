// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(401);
  });

  // Using a valid username/password pair should give a success result with a newly created fragment metadata
  test('authenticated users can post fragment data', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // Any post attempt using invalid username/password pair should be forbidden
  test('cannot post fragment data if user does not have appropriate credentials', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('random@email.com', 'password1');
    expect(res.statusCode).toBe(401);
  });

  // Authenticated users should be able to successfully create text/plain object
  test('authenticated users can create text/plain fragment', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    const fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.body.fragment).toEqual(fragment);
  });

  // Authenticated users will only be able to add supported type of fragments
  test('will not accept unsupported Content-type', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'video/avi')
      .send(data)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  // Fragment metadata must have pre-determined list of properties
  test('created fragment metadata has all expected properties', async () => {
    const data = Buffer.from('hello');
    const size = Buffer.byteLength(data);
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');

    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('type');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment).toHaveProperty('size');
    expect(res.body.fragment.size).toEqual(size);
  });

  // Fragment size matches the size of the buffer
  test('fragment size equals the size of fragment buffer', async () => {
    const data = Buffer.from('hello');
    const size = Buffer.byteLength(data);
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');

    const fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(fragment.size).toEqual(size);
  });

  // Make sure that appropriate Location is being sent in a header
  test('Location header is returned as expected', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');
    expect(res.header['location']).toBe(
      'http://localhost:8080/v1/fragments/' + res.body.fragment.id
    );
  });

  // fragment properties match expectations for a given request
  test('all expected properties that have expected type', async () => {
    const data = Buffer.from('hello');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data)
      .auth('user1@email.com', 'password1');

    expect(typeof res.body.fragment.id).toBe('string');
    expect(typeof res.body.fragment.ownerId).toBe('string');
    expect(typeof res.body.fragment.type).toBe('string');
    expect(typeof res.body.fragment.size).toBe('number');
    expect(Date.parse(res.body.fragment.created)).not.toBeNaN();
    expect(Date.parse(res.body.fragment.updated)).not.toBeNaN();
  });

  test('attempt to create a fragment without data gets rejected', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.status).toBe(500);
  });

  test("authorized users can create 'application/json' fragment", async () => {
    const data = {
      'text/plain': ['txt'],
      'text/markdown': ['md', 'html', 'txt'],
      'text/html': ['html', 'txt'],
      'application/json': ['json', 'txt'],
      'image/*': ['png', 'jpg', 'webp', 'gif'],
    };
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send(data)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // Check if fragment exists in the In-Memory Database
    const fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.body.fragment).toEqual(fragment);
  });

  test('authorized users can create fragment with content-type - image/*', async () => {
    const data = Buffer.from('Imagine it is an image');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'image/jpeg')
      .send(data)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // Check if fragment exists in the In-Memory Database
    const fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.body.fragment).toEqual(fragment);
  });
});
