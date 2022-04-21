const TokenModel = require("../models/tokenModel");

const sendToken = async (user, statusCode, res) => {
    const userProfile = {
        name: user.name,
        email: user.email,
        role:user.role
    }
    let userToken = await TokenModel.findOne({ user: user._id })

    if (!userToken) {
        userToken = await TokenModel.create({
            user: user._id
        })
    }
    const token = await userToken.generateToken();
    // cookie options
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    res.status(statusCode).cookie("jwt", token, options).cookie("profile", userProfile, options).json({
        success: true,
    })
}
module.exports = sendToken;