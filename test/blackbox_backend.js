const request = require('supertest');
const app = require('../app.js');
const Schema = require('../models/Schema.js');
const User = Schema.User;
const Entity = Schema.Entity;
const Poll = Schema.Poll;
const PollVote = Schema.PollVote;
const Rating = Schema.Rating;
const Comment = Schema.Comment;
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

  it('should return 200', (done) => {
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

describe('POST entity creation (logged in)', () => {
  it('should create and render entity page', (done) => {
    agent
      .post('/entity-submit')
      .type('form')
      .send({
        name: "TestCreatedEntity1",
        tags: "test, entity, CreatedEntity1",
        rating: 7,
        comment: "TestCreatedEntity1 Comment",
        anon: false
      })
      .expect(302, done)
      .expect('Location', /\/entity\/*/);
  });
});

describe('POST poll creation (logged in)', () => {
  it('should create and render poll page', (done) => {
    agent
      .post('/poll-submit')
      .type('form')
      .send({
        question: "TestCreatedPoll1",
        option1: "CreatedPoll1_O1", 
        option2: "CreatedPoll1_O2", 
        option3: "CreatedPoll1_O3", 
        option4: "CreatedPoll1_O4", 
        tags: "test, poll, CreatedPoll1",
        anon: false,
        duration: 7
      })
      .expect(302, done)
      .expect('Location', /\/poll\/*/);
  });
});

describe('POST rating/comment creation (logged in)', () => {
  it('should update entity page', (done) => {
    agent
      .post('/rating-submit')
      .type('form')
      .send({
        rating: 5,
        comment: "TESTCreatedComment", 
        anon: false,
        entityId: "59f68a380b93ac9d850e95d8"
      })
      .expect(302, done)
      .expect('Location', "/entity/59f68a380b93ac9d850e95d8");
  });
});

describe('POST poll vote creation (logged in)', () => {
  it('should update poll page', (done) => {
    agent
      .post('/pollvote-submit')
      .type('form')
      .send({
        survey: "2",
        anon: false,
        pollId: "59f689fb0b93ac9d850e95d7"
      })
      .expect(302, done)
      .expect('Location', "/poll/59f689fb0b93ac9d850e95d7");
  });
});

