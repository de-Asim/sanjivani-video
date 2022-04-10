const mongoose = require('mongoose')
const User = require('./userModel')
const Video = require('./videoModel')

const likeSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        unique:true
    },
    likedVideos:[
        {
            type:mongoose.Schema.ObjectId,
            ref:Video,
            required:true
        }
    ]
})

const UserLike = mongoose.model('UserLike',likeSchema)

module.exports = UserLike
