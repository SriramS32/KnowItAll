const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Poll = Schema.Poll;
const Comment = Schema.Comment;
const PollVote = Schema.PollVote;

exports.freeTextSearch = function(query) {

};

exports.keywordSearch = function(query) {
    let pollPromise = Poll.find( { tags: { $in: query }} ).exec();
    let entityPromise = Entity.find( { tags: { $in: query }} ).exec();
    return {
        poll: pollPromise,
        entity: entityPromise
    };
};

exports.fetchTrendingPolls = function() {

};

exports.fetchTrendingEntities = function() {

}

exports.getRecentActivity = function(user) {
    let ratingPromise = Entity.find( {user: user} ).exec();
    let commentPromise = Comment.find( {ownerId: user} ).exec();
    let pollVotePromise = PollVote.find( {user: user} ).exec();
    let pollPromise = Poll.find( {owner: user} ).exec();
    return {
        rating: ratingPromise,
        comment: commentPromise,
        pollVote: pollVotePromise,
        poll: pollPromise
    };
};

exports.filterTags = function (results, tags) {
    return results.filter((entry, index, res) => {
        return entry.tags.filter((e, i, a) => {
            return tags.includes(e);
        }).length > 0;
    });
}