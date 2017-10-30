const { expect } = require('chai');
const assert = require('assert');
const sinon = require('sinon');
require('sinon-mongoose');

const userController = require('../controllers/user');
const searchController = require('../controllers/search');
const pollController = require('../controllers/poll');
const entityController = require('../controllers/entity');

const Schema = require('../models/Schema');
const User = Schema.User;

const mongoose = require('mongoose');
const testUser1 = "59f6898be38c0c9cf88945ce"; // Sri test user
const testUser2 = "59f6898be38c0c9cf88945cd"; // Hemant test user
// const actualUser = mongoose.Schema.Types.ObjectId(testUser1);

describe('User Model', () => {
  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;

    UserMock
      .expects('save')
      .yields(null);

    user.save((err) => {
      UserMock.verify();
      UserMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should not create a user with the unique email', (done) => {
    const UserMock = sinon.mock(User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'MongoError',
      code: 11000
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      email: 'test@gmail.com'
    };

    userMock
      .expects('findOne')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedUser);

    User.findOne({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.email).to.equal('test@gmail.com');
      done();
    });
  });

  it('should remove user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedResult = {
      nRemoved: 1
    };

    userMock
      .expects('remove')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedResult);

    User.remove({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    });
  });

  // Below are the fake database tests
});

describe('Poll Model', () => {

  it('should check current poll votes', (done) => {
    let myPollId = "59f689fb0b93ac9d850e95d7";
    let myUserId = testUser1;
    pollController.fetchPollCounts(myPollId).then((result) => {
      result.forEach(function(element) {
        expect(element.choice).to.equal(1);
      });
      done();
    }, (err) => {
      assert.isOk(false, 'poll vote checking has failed')
    });
  });

  it('should check incorrect poll votes', (done) => {
    let myPollId = "asdf";
    let myUserId = testUser1;
    pollController.fetchPollCounts(myPollId).then((result) => {

    }, (err) => {
      // expect(err).to.be.null;
      expect(err.name).to.equal('CastError'); // Because there are no results
      done();
    });
  });

  // it('should update a vote', (done) => {
  //   // Vote is 1 to begin with
  //   let userVote = new Number(1);
  //   let myPollId = "59f68a6f0b93ac9d850e95db";
  //   let myUserId = testUser1;
  //   pollController.updatePollVotes(myPollId, myUserId, userVote).then((val) => {
  //     expect(val).to.equal(1);
  //     pollController.fetchPollCounts(myPollId).then((result) => {
  //       result.forEach(function(element) {
  //         expect(element.choice).to.equal(1);
  //       });
  //       done();
  //     }, (err) => {
  //       assert.isOk(false, 'poll vote checking has failed')
  //       done();
  //     });
  //     // });
  //   }, (err) => {
  //     assert.isOk(false, 'poll update has failed');
  //     done();
  //   });
  // });

  it('should create a poll', (done) => {
    let params = new Object();
    params.question = "Where can I get good coffee?";
    params.options = ["Starbucks", "Philz Coffee", "Coffee Leaf", "Parkside"];
    params.owner = "";
    let dateObj = new Date();
    params.createdOn = dateObj;
    params.closedAfter = new Date(dateObj.getTime() + 24*60*60*1000);
    params.tags = ["Food", "Coffee"];
    pollController.insertPoll(params).then((pollId) => {
      expect(pollId.toString()).to.be.a('string');
      expect(pollId.toString()).to.not.equal('');
      done();
    }, (err) => {
      assert.isOk(false, 'poll should be created');
      done();
    });
  });

  
});

describe('Trending', () => {
  it('should properly return trending poll, most recently created poll', (done) => {
    searchController.fetchTrendingPolls(1).then((result) => {
      expect(result[0].question).to.equal("Where can I get good coffee?");
      done();
    });
  });

  it('should not return expired polls', (done) => {
    searchController.fetchTrendingPolls(3).then((result) => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('should properly return trending entities', (done) => {
    searchController.fetchTrendingEntities(1).then((result) => {
      expect(result[0].name).to.equal("Test Entity 2"); // Sorts by id
      expect(result[0].ratingCount).to.equal(2);
      expect(result[0].ratingTotal).to.equal(12);
      done();
    });
  });

  it('should properly return multiple trending entities', (done) => {
    searchController.fetchTrendingEntities(2).then((result) => {
      expect(result[0].name).to.equal("Test Entity 2"); // Sorts by id
      expect(result[0].ratingCount).to.equal(2);
      expect(result[0].ratingTotal).to.equal(12);
      expect(result[1].name).to.equal("Test Entity 1"); // Sorts by id
      expect(result[1].ratingCount).to.equal(2);
      expect(result[1].ratingTotal).to.equal(12);
      done();
    });
  });

  it('should saturate multiple trending entities', (done) => {
    searchController.fetchTrendingEntities(10).then((result) => {
      expect(result[0].name).to.equal("Test Entity 2"); // Sorts by id
      expect(result[0].ratingCount).to.equal(2);
      expect(result[0].ratingTotal).to.equal(12);
      expect(result[1].name).to.equal("Test Entity 1"); // Sorts by id
      expect(result[1].ratingCount).to.equal(2);
      expect(result[1].ratingTotal).to.equal(12);
      expect(result.length).to.equal(2);
      done();
    });
  });
});

describe('Entity Search', () => {
  it('should return proper entity in test db', (done) => {
    searchController.fetchEntity("59f68a380b93ac9d850e95d8").then((result) => {
      expect(result.name).to.equal("Test Entity 1");
      expect(result.ratingCount).to.equal(2);
      expect(result.ratingTotal).to.equal(12);
      done();
    });
  });

  it('should check incorrect entity in test db', (done) => {
    searchController.fetchEntity("incorrect").then((result) => {

    }, (err) => {
      expect(err.name).to.equal('CastError'); // Because there are no results
      done();
    });
  });
});

describe('Entity Model', () => {
  it('should update a rating', (done) => {
    entityController.updateRating("59f68c08ef31bb9f8cf98f00", testUser1, 6, "").then((val) =>{
      expect(val).to.equal(1);
      done();
    });
  });
  // it('should create a new entity, rating, and comment', (done) => {
    
  // });
  // it('should have updated total ratings')
});

// function testFreeSearch(myRegex){
//   let searchResults = searchController.freeTextSearch(myRegex);
//   searchResults.poll
//     .then(function(val){
//       console.log("Polls: ", val);
//     });
//   searchResults.entity
//     .then(function(val){
//       console.log("Entities: ", val);
//     });
// }

// function testKeywordSearch(query){
//   let searchResults = searchController.keywordSearch(query);
//   searchResults.poll
//     .then(function(val){
//       console.log("Polls: ", val);
//     });
//   searchResults.entity
//     .then(function(val){
//       console.log("Entities: ", val);
//     });
// }