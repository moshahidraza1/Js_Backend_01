import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req,res) => {
    // res.status(200).json({
    //     message: "ok registered"
    // })
    //user registration logic

    //get user details from frontend
    const {username, fullName, email, password} = req.body
    console.log(`[ username:  ${username}  fullName: ${fullName}  email: ${email} ]`)
    // validations- not empty
    
    if(
        [username, fullName, email, password].some(
            (field)=> field?.trim()=== "") ){
                throw new ApiError(400, "All fields are required")
            }
            // check if user already exists?
            {
                const existedUser = User.findOne({
                    $or: [{email}, {username}]
                })
                if(existedUser){
                    throw new ApiError(409, "User with email or username already existed")
                }
            }
    // check for images,
            const avatarLocalPath = req.files?.avatar[0]?.path;
            const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // check for avatar
    if(!avatarLocalPath){
        throw new ApiError(400, "Avar file is required")
    }
    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // check if uploaded on cloudinary
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar on cloudinary")
    }
    // create user object- create entry in db
    const user = await User.create({
        username: username.toLower(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""

    })
    // remove password and refresh token field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }
    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User successfully registered")
    )
})

export  {registerUser}