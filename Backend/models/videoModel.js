const mongoose =require('mongoose')
const User = require('./userModel')

const videoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:[3,"please enter atleast 3 charecters"],
        maxlength:[200,"title can not have more than 200 charecters"]
    },
    description:{
        type:String,
        required:true,
        minlength:[3,"please enter atleast 3 charecters"],
        maxlength:[1000,"description can not have more than 1000 charecters"]
    },
    category:{
        type:String,
        required:true
    },
    privacy:{
        type:String,
        required:true
    },
    uploadedBy:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true
    },
    uploadedAt:{
        type:Date,
        default:Date.now()
    },
    link:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        default:0
    },
    dislikes:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    }
})

const Video =mongoose.model('video',videoSchema)
module.exports=Video;