/**
 * GET /
 * Home page.
 */
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
  res.render('escape-velocity', {
    title: 'Landing Page'
  });
};

exports.resultsPage = (req, res) => {
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
  res.render('entity-page', {
     title: 'Entity Page'
   });
};