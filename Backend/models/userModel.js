const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "asim",
        required: true,
        minlength:[3, "please enter atleast 3 charecters"],
        maxlength:[30,"name can not be more than 30 charecters"],
        validate(value){
            if(!validator.isAlpha(value,["en-US"], { ignore: " " })){
                throw new Error("name not valid")
            }
        }
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email not valid")
            }
        }
    },
    mobile: {
        type: Number,
        required: [true, "please enter your mobile no"],
        unique: true,
        min:[1000000000,"invalid number"],
        max:[9999999999, "invalid number"]
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        minlength: [8, "password should be of atleast 8 charecters"]
    },
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
})

// hashing password
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }
    else{
        this.password = crypto.pbkdf2Sync(this.password, process.env.SALT,1000,64,`sha512`).toString(`hex`)   
    }
})


// verifing password
userSchema.methods.verifyUser = async function (password) {
    const hash = crypto.pbkdf2Sync(password, process.env.SALT,1000,64,`sha512`).toString(`hex`)
    return hash === this.password
}

// generating reset password token
userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;