const Schema = require('../models/Schema')
const Poll = Schema.Poll
const PollVote = Schema.PollVote

/**
 * Returns id of poll created
 */
exports.insertPoll = function(pollData){
    const poll = new Poll({
        question: pollData.question,
        options: pollData.options,
        owner: pollData.owner,
        createdOn: pollData.createdOn,
        closedAfter: pollData.closedAfter,
        tags: pollData.tags
    });
    poll.save((err) => {
        if (err) console.log("Error in creating poll, ", err);
    });
    return poll._id
};

/**
 * Updating a poll vote that a single user made
 * Two paths -> User hasn't voted on poll yet or User is updating his/ her poll vote
 * 
 * Params: poll_ID and userID are Mongo Object IDs whereas userVote
 * should be a Number representing choice on Poll
 * 
 * Returns: Nothing. Updates db state.
 */
exports.updatePollVotes = function(poll_ID, userID, userVote){
    console.log('poll id: ' + poll_ID);
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
};

/**
 * Returns a promise with the Poll
 */
exports.getPoll = function(poll_ID){
    return Poll.findOne({_id: poll_ID}).exec();
}

/**
 * Returns a promise with PollVotes
 */
exports.fetchPollCounts = function(poll_ID){
    return PollVote.find({ poll: poll_ID }).exec();
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

/**
 * To be implemented further
 */
exports.buildPollLink = function(poll_ID){
    return 'http://localhost:8080/poll/'.concat(poll_ID);
};