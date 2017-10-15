const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    optionIDs: [Number],
    creationDate: Date,
    expirationDate: Date,
    owner: String
}, { timestamps: true });
