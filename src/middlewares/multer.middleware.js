import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        // read about null in callback(cb)
        cb(null,'./public/temp')
    },
    filename: function(req,file,cb){
        // Todo: handle the situation when user uploads more than one file with same name
        // solution : import uuid library
        cb(null, file.originalname)
    }
})

export const upload = multer(
    {
        storage,
    }
)