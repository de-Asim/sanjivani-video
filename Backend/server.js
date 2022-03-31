const app =require('./app')
const dotenv = require('dotenv')
const connectDB = require('./config/conn')

dotenv.config({path:"backend/config/config.env"})

connectDB();

const server =app.listen(process.env.PORT,()=>{
    console.log(`server started at port ${process.env.PORT}`);
})