import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    // Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{   // uploadonClouinary = store filepath / public link   
    try{
        if (!localFilePath) return null // if there is no file path 
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, 
           { resourc_type : "auto"}
        ) 
        //file has been uploaded successfully , now 
        console.log('file is uploaded on clouinary ', response.url);
        fs.unlinkSync(localFilePath)  /// if uploaded succesfully then also remove that 
        return response ; 
    }catch(error){
        fs.unlinkSync(localFilePath)   /// remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
}


 export {uploadOnCloudinary}