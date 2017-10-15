const bcrypt = require('bcrypt-nodejs');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  userID: Number,
  profile: {
    name: String
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for validating user's email.
 */

userSchema.methods.validateEmail = function validateEmail(candidateEmail) {
  const regex = /^\w+([\.-]?\w+)*@usc.edu/;
  if (regex.test(candidateEmail)) {
    return (true);
  }
  return (false);
};

userSchema.methods.getRatings = function getRatings() {

}

userSchema.methods.getPolls = function getPolls() {

}



const User = mongoose.model('User', userSchema);

module.exports = User;
