const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
  it('should return 302 redirect OK', (done) => {
    request(app)
      .get('/')
      .expect(302, done);
  });
});

describe('GET /login', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /landing', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/landing')
      .expect(200, done);
  });
});

describe('GET /new-entry', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/new-entry')
      .expect(200, done);
  });
});

describe('GET /signup', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET /api', () => {
  it('should return 404 OK', (done) => {
    request(app)
      .get('/api')
      .expect(404, done);
  });
});

describe('GET /contact', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/contact')
      .expect(200, done);
  });
});

describe('GET /random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/reset')
      .expect(404, done);
  });
});

describe('GET entity-page', () => {

  it('should return 302', (done) => {
    request(app)
      .get('/entity/thisisnotavalidentitypage')
      .expect(302, done);
  });

  it('should return 302', (done) => {
    request(app)
      .get('/entity/59f68a380b93ac9d850e95d8')
      .expect(200, done);
  });
});
