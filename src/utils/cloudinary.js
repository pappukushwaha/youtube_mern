import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log("File uploaded successfully on cloudinary", response.url);
        fs.unlinkSync(localFilePath);  //remove file from local storage
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);  //remove file from local storage
        return null;
    }
}

export { uploadOnCloudinary }

// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs/promises'; // Use promises API for non-blocking operations

// // Configure Cloudinary
// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Function to upload a file to Cloudinary
// const uploadOnCloudinary = async (localFilePath) => {
//     if (!localFilePath) return null;

//     try {
//         // Upload the file to Cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto", // Auto-detect the file type
//         });
//         console.log("File uploaded successfully on Cloudinary:", response.url);

//         // Return the response from Cloudinary
//         return response;
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error);

//         // Attempt to delete the local file
//         try {
//             await fs.unlink(localFilePath);
//             console.log("Local file deleted successfully.");
//         } catch (unlinkError) {
//             console.error("Error deleting local file:", unlinkError);
//         }

//         return null; // Indicate failure
//     }
// };

// export { uploadOnCloudinary };
