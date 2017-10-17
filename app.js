/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

const searchController = require('./controllers/search');
const pollController = require('./controllers/poll');
const entityController = require('./controllers/entity');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/landing', homeController.landing);
app.get('/new-entry', homeController.newEntryPage);
app.get('/entity-page', homeController.entityPage);
app.get('/escape-velocity', homeController.escapeVelocity);
app.get('/profile-page', homeController.profilePage)

// app.get('/results-page', homeController.resultsPage);

// app.post('/results-page/', searchController.freeTextSearch);
app.post('/results-page/', searchController.search);

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);


/**
 * Error Handler.
 */
app.use(errorHandler());

// db.users.insertOne({"email":"sriramso@usc.edu","password":"abc123","profile": "Sriram"})
function testCreatePoll(){
  let params = new Object();
  params.question = "Where can I get good coffee?";
  params.options = ["Starbucks", "Philz Coffee", "Coffee Leaf", "Parkside"];
  params.owner = mongoose.Schema.Types.ObjectId("59e420f3a05ae191bda98efe");
  let dateObj = new Date();
  params.createdOn = dateObj;
  params.closedAfter = new Date(dateObj.getTime() + 24*60*60*1000);
  params.tags = ["Food", "Coffee"];
  let pollid = pollController.insertPoll(params);
  console.log(pollid);
}

function testPollVote(){
  let userVote = new Number(1);
  let myPollId = "59e444bceb6acc3b4764c10d";
  let myUserId = "59e420f3a05ae191bda98efe";
  pollController.updatePollVotes(myPollId, myUserId, userVote);
}

function testPollVoteUpdate(){
  let userVote = new Number(2);
  let myPollId = "59e444bceb6acc3b4764c10d";
  let myUserId = "59e420f3a05ae191bda98efe";
  pollController.updatePollVotes(myPollId, myUserId, userVote);
}

function testFreeSearch(myRegex){
  let searchResults = searchController.freeTextSearch(myRegex);
  searchResults.poll
    .then(function(val){
      console.log("Polls: ", val);
    });
  searchResults.entity
    .then(function(val){
      console.log("Entities: ", val);
    });
}

function testKeywordSearch(query){
  let searchResults = searchController.keywordSearch(query);
  searchResults.poll
    .then(function(val){
      console.log("Polls: ", val);
    });
  searchResults.entity
    .then(function(val){
      console.log("Entities: ", val);
    });
}

function testTrending(limit){
  searchController.fetchTrendingPolls(limit)
    .then(function(val){
      console.log("Polls: ", val);
    });
  searchController.fetchTrendingEntities(limit)
    .then(function(val){
      console.log("Entities: ", val);
    });
}

function testRecentActivity(){
  let searchResults = searchController.getRecentActivity("59e420f3a05ae191bda98efe");
  searchResults.rating
    .then(function(val){
      console.log("User ratings ", val);
    });
  searchResults.comment
    .then(function(val){
      console.log("User comments ", val);
    });
  searchResults.pollVote
    .then(function(val){
      console.log("User poll votes ", val);
    });
  searchResults.poll
    .then(function(val){
      console.log("User polls ", val);
    });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
  // testCreatePoll();

  // testPollVote();
  // setTimeout(testPollVoteUpdate, 1000);

  // testFreeSearch("Panda");
  // testFreeSearch("best fast");

  // testKeywordSearch(["Food"]);
  // testKeywordSearch(["Fast Food"]);

  // testTrending(2);

  // testRecentActivity();
  console.log();

});

module.exports = app;
