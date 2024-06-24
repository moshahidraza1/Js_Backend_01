import {v2 as cloudinary} from "cloudinary"
// fs -> file system
import fs from "fs"
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // upload files on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("Respose is: ",  response);
        //file uploades successfully
        // Todo: explore reponse outputs
        // console.log("file is successfully uploaded on cloudinary ", response.url);
        // return response;
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(err){
        // since file upload failed remove the locally saved file
        fs.unlinkSync(localFilePath)
        return null;
    }
}
// utility function to delete the files from cloudinary 
const deleteFromCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath){
            return null
        }
        const response = await cloudinary.uploader.destroy(localFilePath);
        return new ApiResponse(200, "File deleted successfully");
    } catch (error) {
        throw new ApiError(500, "Error while deleting files from cloudinary")
        
    }
}

export {
    uploadOnCloudinary, 
    deleteFromCloudinary
}
