const mongoose = require('mongoose');


const meetingschema = new mongoose.Schema({
    meetingId:{
        type:String
    },
    host: {
    type:String
    }

})


const meetingmodel = mongoose.model('meetingIds',meetingschema);
module.exports = meetingmodel;