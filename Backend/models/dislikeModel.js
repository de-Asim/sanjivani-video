const mongoose = require('mongoose')
const User = require('./userModel')
const Video = require('./videoModel')

const dislikeSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        unique:true
    },
    dislikedVideos:[
        {
            type:mongoose.Schema.ObjectId,
            ref:Video,
            required:true
        }
    ]
})

const UserDislike = mongoose.model('UserDislike',dislikeSchema)

module.exports = UserDislike