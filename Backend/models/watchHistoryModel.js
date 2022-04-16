const { default: mongoose } = require("mongoose");
const User = require("./userModel");
const Video = require("./videoModel");

const watchHistorySchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        unique:true
    },
    history:[{
        videoId:{
            type:mongoose.Schema.ObjectId,
            ref:Video,
            required:true
        },
        date:{
            type:Date,
            default:Date.now()
        }

    }]
})

const WatchHistory = mongoose.model('WatchHistory',watchHistorySchema)

module.exports = WatchHistory