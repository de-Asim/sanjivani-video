const { default: mongoose } = require("mongoose");
const jwt = require('jsonwebtoken')
const User = require("./userModel");

const tokenSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        unique:true,
        required:true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
})

// generating jwt
tokenSchema.methods.generateToken = async function () {
    try {
        const token = jwt.sign({ id: this.user.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

const TokenModel = mongoose.model('Token',tokenSchema)

module.exports = TokenModel