import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "User registered successfully",
    // });
    //get user data from frontend
    //validate user data
    //check if user already exists username, email
    //check for images, check for avatar
    //upload images to cloudinary
    //create user object - create entry in database
    //remove password and refresh token from response
    //check for user creation
    //return response

    const {fullName, email, username, password} = req.body;
    if(!fullName || !email || !username || !password){
       throw new ApiError(400, "All fields are required");
    }
    //check if user already exists
    const userExists = await User.findOne({$or: [{email}, {username}]});
    if(userExists){
        throw new ApiError(409, "User already exists");
    }
    //check for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverLocalPath = req.files?.coverImage[0]?.path;
    let coverLocalPath = null;
    if(req.files?.coverImage && req.files.coverImage.length > 0 && Array.isArray(req.files.coverImage)){
        coverLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
       throw new ApiError(400, "Avatar image is required");
    }

    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiError(500, "Image upload failed");
    }

    //create user object
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage:coverImage?.url || ""
    });

    try {
        const foundUser = await User.findById(user._id, "-password -refreshToken");
        if (!foundUser) {
            throw new ApiError(404, "User not found");
        }
        res.status(201).json(new ApiResponse(201, "User registered successfully", foundUser));
    } catch (error) {
        throw new ApiError(500, "User creation failed");
    }

});

export { registerUser };

