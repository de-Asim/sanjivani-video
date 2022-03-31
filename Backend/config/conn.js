const mongoose = require('mongoose')

const connectDB=()=>{
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
    }).then((data)=>{console.log('Database connection successfull')})
}
module.exports=connectDB;