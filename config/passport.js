const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Schema = require('../models/Schema');
const User = Schema.User;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ email: username + '@usc.edu' }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: 'Invalid email' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password' });
    });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};