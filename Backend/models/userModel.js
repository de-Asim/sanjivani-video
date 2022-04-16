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
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
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
    this.password = await bcrypt.hash(this.password, 10);
})

// generating jwt
userSchema.methods.generateToken = async function () {
    try {
        const token = jwt.sign({ id: this._id.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}
// verifing password
userSchema.methods.verifyUser = async function (password) {
    return await bcrypt.compare(password, this.password)
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