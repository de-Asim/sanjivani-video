const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
const user = require('./routes/userRouter');

app.use(express.json());
app.use(cookieParser())

app.use('/api/v1',user)

module.exports=app;