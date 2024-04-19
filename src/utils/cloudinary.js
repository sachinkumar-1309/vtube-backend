import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import  fs from "fs";//File system


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath)return null

        await cloudinary.uploader.upload(localFilePath ,{
            resource_type:"auto"// TO CLOUDINARY:-Apne pata kro ki extention hai iska video hai ya image hai
        })
        // file uploaded successfully
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlink(localFilePath)//remove the locally saved temprorary files as the upload operation failed  
        return null;
    }
}
export {cloudinary}