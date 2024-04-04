const mongoose = require('mongoose');
const DaySchema = new mongoose.Schema({
   Day: {
        type: Date,
        required: true,
    }
})

const Day = mongoose.model('Day',DaySchema);

module.exports = {Day}