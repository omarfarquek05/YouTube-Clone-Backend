import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import dotenv from 'dotenv';
dotenv.config(); // make sure you load .env before using env variables

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Debug print (ONLY for local testing)
// console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET);

// Delete previous image  function
export const deleteFromCloudinary = async (public_id) => {
    return cloudinary.uploader.destroy(public_id);
};

//upload middleware function
const uploadOnCloudinary = async(localFilePath)=> {
    try {
        if (!localFilePath) return null

        //upload the file on cloudinary's server
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        //console.log("file is uploaded on cloudinary", response.url);


          // Delete the local file only after successful upload
           fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
      //console.error("Cloudinary upload failed", error);
    // Ensure the file is deleted in case of failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
    }
}

export default uploadOnCloudinary;

