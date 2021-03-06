const Schema = require('../models/Schema');
const Entity = Schema.Entity;
const Rating = Schema.Rating;
const Comment = Schema.Comment;
const EntityReport = Schema.EntityReport;

/* istanbul ignore next */
exports.newRating = function(req, res){
    let newRating = new Object();
    let entityId = req.body.entityId;
    newRating.rating = req.body.rating;
    newRating.comment = req.body.comment;
    newRating.owner = req.body.anon ? '' : req.user.name;
    newRating.user = req.user._id;
    // console.log(newRating);
    // console.log(req.body.entityId);
    exports.updateRating(entityId, req.user._id, req.body.rating, newRating.owner)
    .then((success) => {
        if (newRating.comment.length > 0){
            exports.insertComment(newRating, entityId);
        }
    }, (err) => {
        console.log('error: ' + err);
        res.redirect('/error');
    })
    .then((success) => {
        res.redirect(`/entity/${entityId}`);        
    }, (err) => {
        console.log('error: ' + err);
        res.redirect('/error');
    });
}

/* istanbul ignore next */
exports.postEntity = function(req, res){
    let newEntity = new Object();
    newEntity.name = req.body.name;
    newEntity.tags = req.body.tags.split(', ');
    newEntity.rating = req.body.rating;
    newEntity.comment = req.body.comment;

    newEntity.owner = req.body.anon ? '' : req.user.name;
    // newEntity.owner = req.body.anon ? '' : "Sriram",

    newEntity.user = req.user._id; 
    // newEntity.user = "59e42b26a05ae191bda98f00";

    //console.log(newEntity);

    exports.insertEntity(newEntity, req.user._id).then((entityId) => {
        if (entityId) {// Don't remove, inserts Entity
            res.redirect(`/entity/${entityId}`);
            // let entityPromise = Entity.findOne( { _id: entityId }).exec();
            // let commentPromise = Comment.find( { _id: entityId } ).exec();
            // let ratingPromise = Rating.find( { entity: entityId } ).exec();
            // Promise.all([entityPromise, commentPromise, ratingPromise]).then((results) => {
            //     let [entity, comments, ratings] = results;
            //     res.redirect('entity/${entity._id}', {
            //         entity: entity,
            //         comments: comments,
            //         ratings: ratings,
            //         user: req.user
            //     });
            // });
        }
    }, (err) => {
        console.log('error inserting entity: ', err);
    });
    // entityId = exports.insertEntity(newEntity, newEntity.user);
    
}

exports.entityReportSubmit = (req, res) => {
    let entityId = req.body.entityId;
    let userId = req.user._id;
    let report = new EntityReport({
        entity: entityId,
        user: userId,
        active: 1
    });
    report.save((err) => {
        if (err) res.redirect('/error');
        else res.redirect(`/entity/${entityId}`);
    });   
}

/* istanbul ignore next */
exports.insertEntity = function (entityData, user) {
    const entity = new Entity({
        ratingTotal: 0,
        ratingCount: 0,
        ratingAverage: 0,
        name: entityData.name,
        tags: entityData.tags
    });
    return entity.save()
        .then((entity) => {
            return new Promise((res, rej) => {
                exports.updateRating(entity._id, user, entityData.rating, entityData.owner);
                exports.insertComment(entityData, entity._id);
                res(entity._id);
            });
        }, (err) => {
            console.log('error saving entity: ', err);
            return null;
        });
    /*
    return entity.save((err, entity) => {
        if (err) console.log('error saving entity: ', err);
        else {
            exports.updateRating(entity._id, user, entityData.rating, entityData.owner);
            exports.insertComment(entityData, entity._id);
        }
    });
    */
};

exports.updateRating = function (entityId, user, rating, owner) {
    // console.log('entity id: ' + entityId);
    return Rating.findOne({user: user, entity: entityId}).exec().then((ratingEntry) => {
        if (ratingEntry) {
            let ratingDiff = rating - ratingEntry.rating;
            ratingEntry.rating = rating;
            ratingEntry.owner = owner;
            ratingEntry.save((err) => {
                if (err) console.log('error updating rating');
            });
            let entityPromise = Entity.findOne( { _id: entityId } ).exec();
            entityPromise.then((result) => {
                console.log(result.ratingTotal);
                console.log(result.ratingDiff);
                console.log(result.ratingCount);
                var ratingAv = (1.0*(result.ratingTotal+ratingDiff)/(result.ratingCount));
                console.log(ratingAv);
                Entity.findOneAndUpdate({ _id: entityId }, { $inc: { ratingTotal: ratingDiff }, $set: { ratingAverage: ratingAv} }, (err, entity) => {
                    if (err) console.log('error updating total rating: ', err);
                });
            }, (err) => {
                console.log('error checking for existing entity: ' + err);
            });
        }
        else {
            let entityPromise = Entity.findOne( { _id: entityId } ).exec();
            entityPromise.then((result) => {
                console.log(result.ratingTotal);
                console.log(result.ratingDiff);
                console.log(result.ratingCount);
                var ratingAv = (1.0*(result.ratingTotal+rating)/(result.ratingCount+1));
                console.log(ratingAv);
                Entity.findOneAndUpdate({ _id: entityId }, { $inc: { ratingTotal: rating, ratingCount: 1 }, $set: { ratingAverage: ratingAv} }, (err, entity) => {
                    if (err) console.log('error updating total rating: ', err);
                    else if (entity) {
                        console.log('adding to rating table');
                        const ratingEntry = new Rating({ user: user, rating: rating, entity: entityId, owner: owner});
                        ratingEntry.save((err) => {
                            if (err) console.log('error adding rating entry: ', err);
                        });
                    }
                });
            }, (err) => {
                console.log('error checking for existing entity: ' + err);
            });
        }
        return Promise.resolve(1);
    }, (err) => {
        console.log('error checking for existing: ' + err);
        return Promise.reject('error checking for existing: ' + err);
    }); /*(err, ratingEntry) => {
        if (err) 
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
                    const ratingEntry = new Rating({ user: user, rating: rating, entity: entityId, owner: owner});
                    ratingEntry.save((err) => {
                        if (err) console.log('error adding rating entry: ', err);
                    });
                }
            });
        }
    });*/
};

exports.insertComment = function(commentData, entity) {
    const comment = new Comment({
        body: commentData.comment,
        // owner: commentData.anon ? '' : commentData.username,
        owner: commentData.owner,
        ownerId: commentData.user,
        entity: entity
    });
    comment.save((err) => {
        if (err) console.log('error inserting comment: ', err);
    });
};

exports.entityDelete = (req, res) => {
    if (!req.user || !req.user.admin) res.redirect('/error');
    else {
        let entityId = req.body.entityId;
        Entity.findOneAndUpdate( {_id: entityId}, {$set: {hidden: true} }, err => {
            if (err) {
                console.log(err);
                res.redirect('/error');
            }
            else res.redirect('/');
        });
    }
}


/* istanbul ignore next */
exports.entityPage = (req, res) => {
    let entityId = req.params.entityId;
    let userid = req.user ? req.user._id : '';
    if (!entityId) res.redirect('/error');
    else {
        let entityPromise = Entity.findOne( { _id: entityId } ).exec();
        let commentPromise = Comment.find( { entity: entityId } ).exec();
        let ratingPromise = Rating.find( { entity: entityId } ).exec();
        let userReportPromise = userid ? EntityReport.find( { entity: entityId, user: userid } ).exec() : Promise.resolve(['not_logged_in']);
        let reportPromise = EntityReport.find( { entity: entityId } ).exec();
        Promise.all([entityPromise, commentPromise, ratingPromise, userReportPromise, reportPromise]).then((results) => {
            let [entity, comments, ratings, userReport, reports] = results;
            // console.log(reports);
            // console.log(comments);
            let reported = Number(!!userReport.length);
            if (!entity || !comments || !ratings) res.redirect('/error');
            else res.render(`entity-page`, {
                entity: entity,
                comments: comments,
                ratings: ratings,
                user: req.user,
                report: reported,
                numReports: reports.length
            });
        }, (err) => {
            console.log('bad url');
            res.redirect('/error');
        });
    }
  };

/*
  let entityId = entityController.insertEntity({
    name: "Test Entity 1",
    tags: ["Test", "tag"],
    rating: 5
  }, '59e426e80eb24ea3effcfbc1');
  entityController.updateRating('59e42f64c27da15c3e0d7d5a', '59e426e80eb24ea3effcfbc1', 7);
  entityController.updateRating('59e42f7a71a7d05c4892bd15', '59e426e80eb24ea3effcfbc1', 7);

  entityController.insertComment({
    body: 'Test comment body',
    username: 'Hemant Kunda',
    user: '59e426e80eb24ea3effcfbc1',
    anon: false
  }, '59e42cb5a960115aa55602e7');

 */ 
