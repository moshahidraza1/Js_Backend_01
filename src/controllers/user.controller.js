import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({valideBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting access or refresh token")
    }
    
}


const registerUser = asyncHandler(async (req,res) => {
    // res.status(200).json({
    //     message: "ok registered"
    // })
    //user registration logic

    //get user details from frontend
    const {username, fullName, email, password} = req.body
    console.log(`[ username:  ${username}  fullName: ${fullName}  email: ${email} ]`)
    // console.log("Request.body content: ",req.body)
    // validations- fields not empty
    if(
        [username, fullName, email, password].some(
            (field) => field?.trim() === "") ){
                throw new ApiError(400, "All fields are required")
            }
            // check if user already exists?
            {
                const existedUser = await User.findOne({
                    $or: [{email}, {username}]
                })
                if(existedUser){
                    throw new ApiError(409, "User with email or username already existed")
                }
            }
            // console.log("Request.files content: ",req.files)
    // check for images,
            const avatarLocalPath = req.files?.avatar[0]?.path;
            //const coverImageLocalPath = req.files?.coverImage[0]?.path;

            // handle the situation when coverImage is not passed
            let coverImageLocalPath;
            if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
                coverImageLocalPath = req.files.coverImage[0].path;
            }
    // check for avatar
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
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
        username: username.toLowerCase(),
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

//loginUser logic

const loginUser = asyncHandler(async (req,res) => {
    // get username and email from form
    const {username, email, password} = req.body
    // check if username or email fields are empty,
    if(!username && !email){
        throw new ApiError(400, "Username and email are required")
    }
    //allow user with (either email or username)

    // find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User not found")
    }
    // password check
    const isPasswordValid = await isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }
    // access and refresh token
    const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id)
    //send secure cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    }

    return res.status(200)
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
    )
    // land the user to application/ return successfully loggedin message
})
// logout user logic

const logoutUser = asyncHandler(async(req,res)=>{
    //access user
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //remove accessToken from database
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly: true,
        secure: true
    }
     
    // clear cookies
    // send response
    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )
})

export  {
    registerUser,
    loginUser,
    logoutUser
}