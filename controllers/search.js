const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Poll = Schema.Poll;
const Comment = Schema.Comment;
const PollVote = Schema.PollVote;

exports.freeTextSearch = function(req, res) {
    let query = req.body.query;
    let pollPromise = Poll.find( { question: { $regex: query, $options: 'i' }} ).exec();
    let entityPromise = Entity.find( { name: { $regex: query, $options: 'i' }} ).exec();
    Promise.all([pollPromise, entityPromise]).then((results) => {
        let [polls, entities] = results;
        console.log(results);
        res.render('results-page', {
            polls: polls,
            entities: entities
        });
    });
};

exports.keywordSearch = function(req, res) {
    let query = [req.params.category]; // query is an array of tags
    let pollPromise = Poll.find( { tags: { $in: query }} ).exec();
    let entityPromise = Entity.find( { tags: { $in: query }} ).exec();
    Promise.all([pollPromise, entityPromise]).then((results) => {
        let [polls, entities] = results;
        res.render('searchresults', {
            polls: polls,
            entities: entities
        });
    });
};

exports.fetchTrendingPolls = function(limit) {
    return Poll.find({closedAfter: {$gt: new Date()}}).sort({createdOn: -1}).limit(limit).exec();
};

exports.fetchTrendingEntities = function(limit) {
    return Entity.find().sort({_id: -1}).limit(limit).exec();    
}

exports.getRecentActivity = function(user) {
    let ratingPromise = Rating.find( {user: user} ).exec();
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