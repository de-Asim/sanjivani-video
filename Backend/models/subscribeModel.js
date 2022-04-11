const mongoose = require('mongoose')
const User = require('./userModel')

const subscribeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        unique:true
    },
    subscribedChannelId:[
        {
            type:mongoose.Schema.ObjectId,
            ref:User,
            required:true
        }
    ]
})

const Subscribe = mongoose.model('Subscribe',subscribeSchema)

module.exports = Subscribe;