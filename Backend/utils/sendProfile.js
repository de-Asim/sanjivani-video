const sendProfile =async (user,statusCode,res)=>{
    // cookie options
    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE *24*60*60*1000 
        ),
        httpOnly:true
    }
    res.status(statusCode).cookie("profile",user,options).json({
        success:true,
    })
}
module.exports = sendProfile;