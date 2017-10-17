const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  name: String
}, { timestamps: true });

const pollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  createdOn: Date,
  closedAfter: Date,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [String]
}, { timestamps: true });

const pollVoteSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  choice: Number,
  poll: { type: Schema.Types.ObjectId, ref: 'Poll' }
}, { timestamps: true });

const entitySchema = new mongoose.Schema({
  ratingTotal: Number,
  ratingCount: Number,
  name: String,
  tags: [String]
  // id: Schema.Types.ObjectId
}, { timestamps: true });

const ratingSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  owner: String,
  rating: Number,
  entity: { type: Schema.Types.ObjectId, ref: 'Entity' }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  body: String,
  owner: String,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  entity: { type: Schema.Types.ObjectId, ref: 'Entity' }
}, { timestamps: true});

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

userSchema.methods.getRatings = function getRatings() {
  
}

userSchema.methods.getPolls = function getPolls() {

}

const User = mongoose.model('User', userSchema);
const Poll = mongoose.model('Poll', pollSchema);
const PollVote = mongoose.model('PollVote', pollVoteSchema);
const Entity = mongoose.model('Entity', entitySchema);
const Rating = mongoose.model('Rating', ratingSchema);
const Comment = mongoose.model('Comment', commentSchema);

exports.User = User;
exports.Poll = Poll;
exports.PollVote = PollVote;
exports.Entity = Entity;
exports.Rating = Rating;
exports.Comment = Comment;
