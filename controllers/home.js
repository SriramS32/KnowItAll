const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Comment = Schema.Comment;
/**
 * GET /
 * Home page.
 */
const searchController = require('./search');
const userController = require('./user');
exports.index = (req, res) => {
  res.redirect('/landing');
};

exports.landing = (req, res) => {
  Promise.all([searchController.fetchTrendingPolls(2), searchController.fetchTrendingEntities(1)])
  .then((results) => {
    let [polls, entities] = results;
    res.render('landing', {
      polls: polls,
      entities: entities
    });
  });
};

exports.resultsPage = (req, res) => {
  // Promise.all([searchController.freeTextSearch(req.params.query)])

  res.render('results-page', {
     title: 'Results Page'
   });
};

exports.newEntryPage = (req, res) => {
  res.render('new-entry', {
     title: 'New Entry Page'
   });
};

exports.profilePage = (req, res) => {
  if (!req.user) {
    res.redirect('/login');
  }
  else {
    Promise.all([userController.fetchUserPolls(req.user.id, 3), userController.fetchUserRatings(req.user.id, 3)])
    .then((results) => {
      let [pollVotes, ratings] = results;
      if (!pollVotes || !ratings) {
        res.redirect('/error');
      }
      else {
        res.render('profile-page', {
          title: 'Profile Page',
          user: req.user,
          pollVotes: pollVotes,
          ratings: ratings
        });
      }
    });
  }
};

exports.error = (req, res) => {
  res.render('error', {
    title: 'Error'
  });
};