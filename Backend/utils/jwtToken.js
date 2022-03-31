const sendToken =async (user,statusCode,res)=>{
    const token =await user.generateToken();
    // cookie options
    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE *24*60*60*1000 
        ),
        httpOnly:true
    }

    res.status(statusCode).cookie("jwt",token,options).json({
        success:true,
        user,
        token
    })
}
module.exports = sendToken;