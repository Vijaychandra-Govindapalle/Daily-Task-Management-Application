const mongoose = require('mongoose');
const { Day } = require('./date.model');
const TimeSchema = new mongoose.Schema({
    Day: {
        type: Date,
        required: true
    },
   startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true
    }
})

const Time = mongoose.model('Time',TimeSchema);

module.exports = {Time}