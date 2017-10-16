const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Comment = Schema.Comment;

exports.insertEntity = function (entityData, user) {
    const entity = new Entity({
        ratingTotal: 0,
        ratingCount: 0,
        name: entityData.name,
        tags: entityData.tags
    });
    entity.save((err, entity) => {
        if (err) console.log('error saving entity: ', err);
        else {
            exports.updateRating(entity._id, user, entityData.rating);
        }
    });
    return entity._id;
};

exports.updateRating = function (entityId, user, rating) {
    console.log('entity id: ' + entityId);
    Rating.findOne({user: user}, (err, ratingEntry) => {
        if (err) console.log('error checking for existing: ' + err);
        else if (ratingEntry) {
            let ratingDiff = rating - ratingEntry.rating;
            ratingEntry.rating = rating;
            ratingEntry.save((err) => {
                if (err) console.log('error updating rating');
            });
            Entity.findOneAndUpdate({ _id: entityId }, { $inc: { ratingTotal: ratingDiff } }, (err, entity) => {
                if (err) console.log('error updating total rating: ', err);
            });
        }
        else {
            Entity.findOneAndUpdate({ _id: entityId }, { $inc: { ratingTotal: rating, ratingCount: 1 } }, (err, entity) => {
                if (err) console.log('error updating total rating: ', err);
                else if (entity) {
                    console.log('adding to rating table');
                    const ratingEntry = new Rating({ user: user, rating: rating, entity: entityId });
                    ratingEntry.save((err) => {
                        if (err) console.log('error adding rating entry: ', err);
                    });
                }
            });
        }
    });
};

exports.fetchRating = function(entity) {
    return Entity.findOne({_id: entity}, 'ratingTotal ratingCount').exec();
}

exports.insertComment = function(commentData, entity) {
    const comment = new Comment({
        body: commentData.body,
        owner: commentData.anon ? '' : commentData.username,
        ownerId: commentData.user,
        entity: entity
    });
    comment.save((err) => {
        if (err) console.log('error inserting comment: ', err);
    });
};
