const request = require('supertest');
const app = require('../../src/app');

describe('get valid convert', () => {
  test('Check validConversion() pass', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.status).toBe(200);
  });

  test('Check validConversion() fail', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    expect(res.status).toBe(415);
  });

  test('Check validConversion() markdown with ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Check validConversion() html having ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Check validConversion() markdown to html having ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Check validConversion() text no ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Check validConversion() markdown no ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Invalid ID', async () => {
    const res = await request(app)
      .get(`/v1/fragments/1234`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(404);
  });

  test('Check validConversion() test png', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });
});
