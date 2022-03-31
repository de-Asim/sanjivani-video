const nodeMailer = require('nodemailer')
const asyncErr = require('../middleware/asyncErr')

const sendEmail =asyncErr(async(options)=>{
        const transporter = nodeMailer.createTransport({
            host:"smtp.gmail.com",
            port:465,
            service:process.env.SMPT_SERVICE,
            auth:{
                user:process.env.SMPT_MAIL,
                pass:process.env.SMPT_PASS
            }
        })
        const mailOptions={
            from:process.env.SMPT_MAIL,
            to:options.email,
            subject:options.subject,
            text:options.message
        }
        await transporter.sendMail(mailOptions);  
})

module.exports=sendEmail