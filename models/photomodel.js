const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    url : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    poseType : {
        type : String,
        required : true,
    },
    sessionId : {
        type : String,
        required : true,
    },
    public_id : {
        type : String,
        required : true,
    }
});

module.exports = mongoose.model('picture', photoSchema);