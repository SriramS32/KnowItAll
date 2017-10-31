const request = require('supertest');
const app = require('../app.js');

var agent = request.agent(app);

describe('GET /', () => {
  it('should return 302 redirect OK', (done) => {
    request(app)
      .get('/')
      .expect(302, done)
      .expect('Location', '/landing');
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
  it('should return 302 Redirect', (done) => {
    request(app)
      .get('/api')
      .expect(302, done)
      .expect('Location', '/error');
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
  it('should return 302 Redirect', (done) => {
    request(app)
      .get('/reset')
      .expect(302, done)
      .expect('Location', '/error');
  });
});

describe('GET /entity', () => {

  it('should return 302', (done) => {
    request(app)
      .get('/entity')
      .expect(302, done)
      .expect('Location', '/error');
  });

  it('should return 302', (done) => {
    request(app)
      .get('/entity/thisisnotavalidentitypage')
      .expect(302, done)
      .expect('Location', '/error');
  });

  it('should return 302', (done) => {
    request(app)
      .get('/entity/59f68a380b93ac9d850e95d8')
      .expect(200, done);
  });
});

describe('GET /poll', () => {

  it('should return 302', (done) => {
    request(app)
      .get('/poll')
      .expect(302, done)
      .expect('Location', '/error');
  });

  it('should return 302', (done) => {
    request(app)
      .get('/poll/thisisnotavalidpollpage')
      .expect(302, done)
      .expect('Location', '/error');
  });

  it('should return 200', (done) => {
    request(app)
      .get('/poll/59f68a6f0b93ac9d850e95db')
      .expect(200, done);
  });
});

describe('GET /profile-page (not logged in)', () => {
  it('should return 302', (done) => {
    request(app)
      .get('/profile-page')
      .expect(302, done)
      .expect('Location', '/login');
  });
});

describe('POST failed login', () => {
  it('wrong username', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({
        username: 'hkundanot',
        password: 'wronguser'
      })
      .expect(302, done)
      .expect('Location', '/login');      
  });

  it('wrong password', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({
        username: 'hkunda',
        password: 'abcde'
      })
      .expect(302, done)
      .expect('Location', '/login');
  });
});

describe('POST successful login', () => {
  it('correct username/password', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({
        username: 'sriramso',
        password: 'dcba'
      })
      .expect(302, done)
      .expect('Location', '/landing');
  });
});

describe('GET /profile-page (logged in)', () => {

  it('should 302 after login', (done) => {
    agent
      .post('/login')
      .type('form')
      .send({
        username: 'hkunda',
        password: 'abcd'
      })
      .expect(302, done)
      .expect('Location', '/landing');
  });

  it('should return 200', (done) => {
    agent
      .get('/profile-page')
      .expect(200, done);
  })
});