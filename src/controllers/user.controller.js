import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (user_id) => {
    try {
       const user = await User.findById(user_id);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();

       user.refreshToken = refreshToken;
       await user.save({ validateBeforeSave: false });
       return { accessToken, refreshToken };


    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}
   

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    if (!email && !password) {
        throw new ApiError(400, "Email and password are required");
    }


    if (username == undefined && email == undefined) {
        throw new ApiError(400, "Email or Username are required");
    }
    //check if user exists
    const user = await User.findOne({
        $or: [{email}, {username}]
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    //check if password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }
    //generate access token
    //generate refresh token
    //save refresh token to database
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    //return response
    const loggedInUser = await User.findById(user._id, "-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true,
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
       new ApiResponse(
           200,
           {
               user: loggedInUser, accessToken, refreshToken
           },
           "User logged in successfully"
       )
   );
    
});

const logoutUser = asyncHandler(async (req, res) => {

   User.findByIdAndUpdate(req.user._id, {
         $set: {
                refreshToken: undefined
            }
   },
    {
        new: true
    }
    );
    const option = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(404, "Invalid refresh token");
        }
    
        if (user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Access token refreshed successfully"
        ));
    } catch (error) {
        throw new ApiError(401, "Unauthorized request or invalid refresh token");
    }
});



export { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken
};

