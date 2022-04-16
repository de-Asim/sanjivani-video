const mongoose = require('mongoose')
const User = require('./userModel')
const Video = require('./videoModel')

const commentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true
    },
    videoId:{
        type:mongoose.Schema.ObjectId,
        ref:Video,
        required:true
    },
    replyingTo:{
        type:mongoose.Schema.ObjectId,
    },
    text:{
        type:String,
        required:true,
        maxlength:[1000,"comments can not have more than 1000 charecters"]
    }
})

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment