const multer = require("multer")
const videoStorageEngine=multer.diskStorage({
    destination:(req,file,cb)=>{
        const dir ="./Upload/"+file.fieldname
        cb(null,dir)
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"_"+file.originalname)
    }
})

exports.videoUpload =multer({storage:videoStorageEngine})