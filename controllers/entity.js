const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Comment = Schema.Comment;

exports.insertEntity = function (entityData) {
    const entity = new Entity({
        ratingTotal: 0,
        ratingCount: 0,
        name: entityData.name
    });
    entity.save((err) => {
        if (err) console.log('error saving entity: ', err);
    });
    return entity.id;
};

exports.updateRating = function (entityId, user, rating) {
    Entity.findOneAndUpdate({ id: entityId }, { $inc: { ratingTotal: rating, ratingCount: 1 } }, (err, entity) => {
        if (err) console.log('error updating total rating: ', err);
        else if (entity) {
            const rating = new Rating({ user: user, rating: rating, entity: entityId });
            rating.save((err) => {
                if (err) console.log('error adding rating entry: ', err);
            });
        }
    });
};

exports.fetchRating = function(entity) {
    return Entity.findOne({id: entity}, 'ratingTotal ratingCount').exec();
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
