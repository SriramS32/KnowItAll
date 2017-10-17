const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Comment = Schema.Comment;
/**
 * GET /
 * Home page.
 */
const searchController = require('./search');
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.landing = (req, res) => {
  res.render('layout', {
     title: 'Landing Page'
   });
};

exports.escapeVelocity = (req, res) => {
  Promise.all([searchController.fetchTrendingPolls(2), searchController.fetchTrendingEntities(1)])
    .then((results) => {
      let [polls, entities] = results;
      res.render('escape-velocity', {
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

exports.entityPage = (req, res) => {
  // searchController.fetchEntity(req.params.entityId).then((entity) => {
  //   res.render('entity-page', {
  //     title: 'Entity Page',
  //     entity: entity,

  //   });
  // }, (err) => {
    
  // })
  let entityId = req.params.entityId;
  let entityPromise = Entity.findOne( { _id: entityId }).exec();
  let commentPromise = Comment.find( { entity: entityId } ).exec();
  let ratingPromise = Rating.find( { entity: entityId } ).exec();
  Promise.all([entityPromise, commentPromise, ratingPromise]).then((results) => {
      let [entity, comments, ratings] = results;
      console.log(ratings);
      console.log(comments);
      res.render(`entity-page`, {
          entity: entity,
          comments: comments,
          ratings: ratings,
          user: req.user
      });
  });
};

exports.profilePage = (req, res) => {
  res.render('profile-page', {
    title: 'Profile Page'
  });
};

exports.pollPage = (req, res) => {
  res.render('poll-page', {
      title: 'Poll Page'
  });
};