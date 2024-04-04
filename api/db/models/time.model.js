const mongoose = require('mongoose');
const { Day } = require('./date.model');
const TimeSchema = new mongoose.Schema({
    Day: {
        type: Date,
        required: true
    },
   Time: {
        type: String,
        required: true,
    }
})

const Time = mongoose.model('Time',TimeSchema);

module.exports = {Time}