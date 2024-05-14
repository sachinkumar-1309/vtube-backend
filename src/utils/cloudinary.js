import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //File system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SERET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      }, // TO CLOUDINARY:-Apne pata kro ki extention hai iska video hai ya image hai
    );
    // file uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath); //delete the local file after successfully being uploaded on cloudinary
    return response;
  } catch (error) {
    console.log("CLoudinary error: "+JSON.stringify(error))
    fs.unlinkSync(localFilePath); //remove the locally saved temprorary files as the upload operation failed

    return null;
  }
};

export { uploadOnCloudinary };
