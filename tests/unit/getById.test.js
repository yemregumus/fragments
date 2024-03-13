// tests/unit/getById.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // User should not be able to get access to fragments without appropriate credentials
  test('cannot get fragment data if user does not have appropriate credentials', () =>
    request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .auth('random@email.com', 'password1')
      .expect(401));

  //only authenticated users can access fragments
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698').expect(401));

  // Make sure that appropriate response header returns Content-Type and Content-Length
  test('Response header contains Content-Type and Content-Length properties', async () => {
    const data = Buffer.from('hello');
    const dataSize = Buffer.byteLength(data);

    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    const fragmentUrl = `/v1/fragments/${postReq.body.fragment.id}`;

    const res = await request(app).get(fragmentUrl).auth('user1@email.com', 'password1');
    expect(res.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.header['content-length']).toEqual(dataSize.toString());
  });

  test('return fragment by id', async () => {
    const data = Buffer.from('hello');
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const fragmentUrl = `/v1/fragments/${postReq.body.fragment.id}`;
    const res = await request(app).get(fragmentUrl).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('text/plain');
  });

  test('trying to access nonexistent fragment will return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('invalid conversion type is rejected', async () => {
    const data = Buffer.from('hello');
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const fragmentUrl = `/v1/fragments/${postReq.body.fragment.id}.jpeg`;
    const res = await request(app).get(fragmentUrl).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });

  test('markdown type fragment can be converted to HTML', async () => {
    const data = '# Header';
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(data);

    const res = await request(app)
      .get('/v1/fragments/' + postReq.body.fragment.id + '.html')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('<h1>Header</h1>\n');
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
