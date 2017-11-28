const Schema = require('../models/Schema');
const Poll = Schema.Poll;
const PollVote = Schema.PollVote;
const PollLike = Schema.PollLike;
const PollReport = Schema.PollReport;


exports.postPoll = function(req, res) {
    let pollData = {};
    pollData.question = req.body.question;
    let options = [];
    for (let i = 1; i <= req.body.numOptions; i++) {
        options.push(req.body['option'+i]);
    }
    pollData.options = options.filter((e) => {
                            return e.length > 0;
    });
    pollData.owner = req.body.anon ? '' : req.user.name;
    pollData.ownerId = req.user._id;
    pollData.createdOn = new Date();
    pollData.closedAfter = new Date(pollData.createdOn.getTime() + 1000*60*60*24*req.body.duration);
    pollData.tags = req.body.tags.split(',').map(e => e.trim());
    // console.log(pollData);
    exports.insertPoll(pollData).then((pollId) => {
        res.redirect(`/poll/${pollId}`);
    }, (err) => {
        console.log('error: ' +  err);
        res.redirect('/error');
    })
}

exports.pollVoteSubmit = (req, res) => {
    let pollId = req.body.pollId;
    let userId = req.user._id;
    let pollChoice = parseInt(req.body.survey);
    exports.updatePollVotes(pollId, userId, pollChoice).then((success) => {
        res.redirect(`/poll/${pollId}`);
    });
}

exports.pollLikeSubmit = (req, res) => {
    let pollId = req.body.pollId;
    let userId = req.user._id;
    let likeChoice = parseInt(req.body.choice);
    console.log(pollId + " | " + userId + " | " + likeChoice);
    exports.updatePollLikes(pollId, userId, likeChoice).then((success) => {
        res.redirect(`/poll/${pollId}`);
    }, (err) => {
        console.log(err);
        res.redirect('/error');
    });
}

exports.pollReportSubmit = (req, res) => {
    let pollId = req.body.pollId;
    let newVal = req.body.report;
    let userId = req.user._id;
    let report = new PollReport({
        poll: pollId,
        user: userId,
        active: 1
    });
    console.log('new report');
    console.log(report);
    report.save((err) => {
        if (err) res.redirect('/error');
        else res.redirect(`/poll/${pollId}`);
    });   
}

/**
 * Returns id of poll created
 */
exports.insertPoll = function(pollData){
    const poll = new Poll({
        question: pollData.question,
        options: pollData.options,
        owner: pollData.owner,
        createdOn: pollData.createdOn,
        likeWeight: 0,
        closedAfter: pollData.closedAfter,
        tags: pollData.tags
    });
    return poll.save().then((poll) => {
        return Promise.resolve(poll._id);
    }, (err) => {
        return Promise.reject('error creating poll');
    });
};

/**
 * Updating a poll vote that a single user made
 * Two paths -> User hasn't voted on poll yet or User is updating his/ her poll vote
 * 
 * Params: poll_ID and userID are Mongo Object IDs whereas userVote
 * should be a Number representing choice on Poll
 * 
 * Returns: Promise that resolves upon successful update, rejects on failure.
 */
exports.updatePollVotes = function(poll_ID, userID, userVote){
//    console.log('poll id: ' + poll_ID);
    return PollVote.findOne({user: userID, poll: poll_ID}).exec().then((pollEntry) => {
        if (pollEntry) {
            // Updating poll choice
            // console.log('Updating poll choice ');
            return new Promise((resolve, reject) => {
                pollEntry.choice = userVote;
                pollEntry.markModified("choice");                
                pollEntry.save((err) => {
                    if (!err) resolve(1);
                    else reject(0);
                });
            });
            /*
            return pollEntry.save().then((entry) => {
                console.log("saved! ", entry);
                return exports.fetchPollCounts(poll_ID).then((results) => {
                    console.log("after save, we have:", results);
                    return Promise.resolve(1);                    
                });
            }, (err) => {
                console.log("just saved: ", err);
                if (err) console.log('error updating poll choice to ', userVote);
            });*/
        }
        else {
            const pollVote = new PollVote({
                user: userID,
                poll: poll_ID,
                choice: userVote
            });
            pollVote.save((err) => {
                if (err) console.log("Error in making poll choice, ", err);
            });
            // console.log('Creating new poll vote with id ', pollVote._id);
        }
        return Promise.resolve(1);
    }, (err) => {
        console.log('error checking for existing: ' + err);
        return Promise.reject('error checking for existing: ' + err);
    })
    /*
    PollVote.findOne({user: userID, poll: poll_ID}, (err, pollEntry) => {
        if (err) console.log('error checking for existing: ' + err);
        else if (pollEntry) {
            // Updating poll choice
            console.log('Updating poll choice');
            pollEntry.choice = userVote;
            pollEntry.save((err) => {
                if (err) console.log('error updating poll choice to ', userVote);
            });
        }
        else {
            const pollVote = new PollVote({
                user: userID,
                poll: poll_ID,
                choice: userVote
            });
            pollVote.save((err) => {
                if (err) console.log("Error in making poll choice, ", err);
            });
            console.log('Creating new poll vote with id ', pollVote._id);
        }
    });
    */
};

/**
 * Updating a poll like that a single user made
 * Two paths -> User hasn't liked/disliked poll yet or User is updating his/her poll like
 * 
 * Params: poll_ID and userID are Mongo Object IDs whereas userVote
 * should be a Number representing their contribution towards Poll Like
 * 
 * Returns: Promise that resolves upon successful update, rejects on failure.
 */
exports.updatePollLikes = function(poll_ID, userID, userVote) {
    return PollLike.findOne({user: userID, poll: poll_ID}).exec().then((likeEntry) => {
        let likeIncrement = -1;
        if (userVote === 1) likeIncrement = 1;
        if (likeEntry) {
            // Updating poll choice
            // console.log('Updating poll choice ');
            if (likeEntry.weight != likeIncrement) likeIncrement *= 2;
            Poll.findOneAndUpdate({ _id: poll_ID }, { $inc: { likeWeight: likeIncrement } }, (err, entity) => {
                if (err) console.log('error updating poll like weights: ', err);
            });
            return new Promise((resolve, reject) => {
                likeEntry.weight = userVote;
                likeEntry.markModified("weight");                
                likeEntry.save((err) => {
                    if (!err) resolve(1);
                    else reject(0);
                });
            });
        }
        else {
            Poll.findOneAndUpdate({ _id: poll_ID }, { $inc: { likeWeight: likeIncrement } }, (err, entity) => {
                if (err) console.log('error updating poll like weights: ', err);
            });
            const pollLike = new PollLike({
                user: userID,
                poll: poll_ID,
                weight: userVote
            });
            return new Promise((resolve, reject) => {
                pollLike.save((err) => {
                    if (err) {
                        console.log("Error in making poll choice, ", err);
                        reject(0);
                    }
                    else resolve(1);
                });
            })
            // console.log('Creating new poll vote with id ', pollVote._id);
        }
        
        // let pollLikePromise = exports.fetchPollLikes(poll_ID);
        // let up = 0, down = 0, user = 0;
        // likes.forEach((e) => {
        //     if (e.weight === 1) up++;
        //     else down++;
        //     if (e.user.equals(user_id)) user = e.weight;
        // });
        // return [up, down, user];

    }, (err) => {
        console.log('error checking for existing: ' + err);
        return Promise.reject('error checking for existing: ' + err);
    });
};
    
exports.pollDelete = (req, res) => {
    if (!req.user || !req.user.admin) res.redirect('/error');
    else {
        let pollId = req.body.pollId;
        Poll.findOneAndUpdate( {_id: pollId}, {$set: {hidden: true} }, err => {
            if (err) {
                console.log(err);
                res.redirect('/error');
            }
            else res.redirect('/');
        });
    }
}

/**
 * Returns a promise with the Poll
 */
exports.getPoll = function(poll_ID){
    return Poll.findOne({_id: poll_ID}).exec();
}

/**
 * Returns a promise with PollVotes
 */
exports.fetchPollCounts = (poll_ID) => {
    return PollVote.find({ poll: poll_ID }).exec();
}

exports.fetchPollLikes = (poll_ID) => {
    return PollLike.find({ poll: poll_ID }).exec();
}

exports.fetchPollReports = (poll_ID) => {
    return PollReport.find({ poll: poll_ID }).exec();
}

exports.fetchPollReportForUser = (poll_ID, userId) => {
    return PollReport.find({ poll: poll_ID, user: userId }).exec();
}

exports.fetchPollReports = (poll_ID) => {
    return PollReport.find({ poll: poll_ID }).exec();
}

// /**
//  * No need for updateVoteCount when displaying the polls.
//  * Question and options below current chart displaying number for each poll choice.
//  * Query poll vote collection for poll votes matching poll id and count choices on the spot.
//  * Returns Object:
//  *      options: [String]
//  *      counts:  [Number]
//  */
// exports.fetchPollCounts2 = function(poll_ID){
//     // pollOptions = [];
//     // var promise = getPoll(poll_ID)
//     //     .then(function (pollOpt){

//     //     })
//     //     .then(function (result){
//     //         pollCounts = []
//     //         return pollCounts
//     //     });

//     let promise = getPoll(poll_ID);
//     promise
//         .then(function (pollOpt){
//             pollCounts = new Array(pollOpt.length);
//             pollCounts.fill(0); // Initializing counts for each option to 0

//             PollVote.find({ poll: poll_ID }, function(err, voteDocs) {
//                 if (err) console.log("Error while fetching poll counts, ", err);
//                 if (! voteDocs){
//                     // Do something
//                     console.log("No poll counts for this id, ", poll_ID);
//                 }
//                 else{
//                     voteDocs.forEach(function(voteDoc) {
//                         pollCounts[voteDoc.choice] += 1
//                     });
//                 }
//                 let retVal = new Object();
//                 retVal.options = pollOpt;
//                 retVal.counts = pollCounts
//                 return retVal;
//             });
//         }).error(function(error){
//             console.log(error);
//         });
//     // });
//     // return pollCounts;


//     // Poll.findOne({_id: poll_ID}, function(err, pollDoc) {
//     //     if (err) console.log("Error while fetching poll, ", err);
//     //     if (! pollDoc){
//     //         // Do something
//     //         console.log("No poll this id, ", poll_ID);
//     //     }
//     //     else{
//     //         pollOptions = pollDoc.options;
//     //     }
//     //     pollCounts = new Array(pollOptions.length);
//     //     pollCounts.fill(0); // Initializing counts for each option to 0
//     //     PollVote.find({poll: poll_ID}, function(err, voteDocs) {
//     //         if (err) console.log("Error while fetching poll counts, ", err);
//     //         if (! voteDocs){
//     //             // Do something
//     //             console.log("No poll counts for this id, ", poll_ID);
//     //         }
//     //         else{
//     //             voteDocs.forEach(function(voteDoc) {
//     //                 pollCounts[voteDoc.choice] += 1
//     //             });
//     //         }
//     //     });
//     //     return pollCounts;

//     // });
// }

/* istanbul ignore next */
function aggregateVotes(voteDocs, numOptions, user_id) {
    let pollCounts = new Array(numOptions);
    pollCounts.fill(0);
    let userChoice = -1;
    voteDocs.forEach(function(voteDoc) {
        pollCounts[voteDoc.choice] += 1
        if (voteDoc.user.equals(user_id)) userChoice = voteDoc.choice;
    });
    return [pollCounts, userChoice];
}

function percentages(counts) {
    let percentages = new Array(counts.length);
    percentages.fill(0);
    let totalVotes = counts.reduce((total, vote) => total + vote);
    if (totalVotes == 0) return percentages;
    //console.log(percentages.map(e => (100.0*e/totalVotes).toFixed()));
    return counts.map(e => (100.0*e/totalVotes).toFixed());
}
/* istanbul ignore next */
function aggregateLikes(likes, user_id) {
    let up = 0, down = 0, user = 0;
    likes.forEach((e) => {
        if (e.weight === 1) up++;
        else down++;
        if (e.user.equals(user_id)) user = e.weight;
    });
    return [up, down, user];
}

exports.percentages = function(counts){
    return percentages(counts);
}

/**
 * To be implemented further
 */
exports.buildPollLink = function(poll_ID){
    return 'http://localhost:8080/poll/'.concat(poll_ID);
};

exports.pollPage = (req, res) => {
    let pollId = req.params.pollId;
    let userid = req.user ? req.user._id : '';    
    if (!pollId) res.redirect('/error');
    let pollPromise = Poll.findOne( {_id: pollId} ).exec();
    let pollVotePromise = exports.fetchPollCounts(pollId);
    let pollLikePromise = exports.fetchPollLikes(pollId);
    let userReportPromise = userid ? exports.fetchPollReportForUser(pollId, userid) : Promise.resolve(['not_logged_in']);
    let reportPromise = exports.fetchPollReports(pollId);    
    Promise.all([pollPromise, pollVotePromise, pollLikePromise, userReportPromise, reportPromise]).then((results) => {
        let [poll, votes, likes, userReport, reports] = results;
        console.log('rendering pollpage');
        console.log(results);
        if (!poll) res.redirect('/error');
        else {
            let reported = Number(!!userReport.length);
            console.log(reported);
            let [counts, userVote] = aggregateVotes(votes, poll.options.length, userid);
            let [upLikes, downLikes, userLike] = aggregateLikes(likes, userid);
            res.render('poll-page', {
                title: 'Poll Page',
                poll: poll,
                votes: counts,
                userVote: userVote,
                percentages: percentages(counts),
                upLikes: upLikes,
                downLikes: downLikes,
                userLike: userLike,
                report: reported,
                loggedIn: !!userid,
                admin: userid ? req.user.admin : false,
                numReports: reports.length
            });
        }
    }, (err) => {
        console.log(err);
        res.redirect('/error');
    });
};