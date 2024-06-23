import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const options = {
    maxAge: 24*60*60*1000,
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: "/",
};

const generateAccessAndRefreshToken = async(userId)=>{
    
    try {
        const user = await User.findById(userId)
       
        if (!user) {
            throw new ApiError(401, "Could not find user")
        }
        //errors in 
        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false})
       
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
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }
    // access and refresh token
     // ~=invested 4 hours in debugging and issue was that await was missing here
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
   
    //send secure cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // const options = {
    //     httpOnly:true,
    //     secure: false
    // }

    return res.status(200)
    .cookie("accessToken", accessToken, options )
    .cookie("refreshToken", refreshToken, options )
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"

        )
    );
    // land the user to application/ return successfully loggedin message
})
// logout user logic

const logoutUser = asyncHandler(async(req,res)=>{
    //access user
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //remove accessToken from database
            $unset: {
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )
    

    // const options ={
    //     httpOnly: true,
    //     secure: false
    // }
     
    // clear cookies
    // send response
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )
})

// refresh user access token using refreshToken logic
const refreshAccessToken = asyncHandler(async (req, res) => {
    // get current refreshToken from user
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        //verify refreshToken
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // extract id from jwt payload
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh Token")
        }
        //check if incomingRefreshToken is equal to refreshToken in DB
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        // generate new accessToken
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        // update cookies
        // const options = {
        //     httpOnly: true,
        //     secure: false
        // }

        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(200,
                {accessToken, refreshToken:newRefreshToken},
                "Access Token refreshed"
            )
        )



    } catch (error) {
        throw new ApiError(401, "Unauthorized Access")
    }
})

// writing code for updating user details

// update user details
const updateUserAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "fullName and email are required.")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }   
    },
    {new: true}
    ).select("-password")

    // if(!user){
    //     throw new ApiError(400, "Unauthorized request for changing email and fullname.")
    // }

    res.status(200)
    .json( new ApiResponse(200, user, "updated email and fullName. "))
})
// update password while user is loggedin
const changeCurrentPassword = asyncHandler( async(req, res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect old password")
    }

    // User.findByIdAndUpdate(
    //     req.user?._id,
    //     {
    //         $set: {
    //             password: newPassword
    //         },
    //         {new: true}
    //     }
    // ) 

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password updated successfully")
    )
})

// how to get current user

const getCurrentUser = asyncHandler(async(req,res)=>{
    //Todo: check if req.user is correct here and alo print this req.user
    console.log("Inside getCurrentUser",req.user)
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User fetched successfully.")
    )
})

// update avatar

const updateAvatarImage = asyncHandler(async(req,res)=>{
    // const user = await User.findById(req.user?._id)
        // got the user now get avatarLocalPath and then check if it is correct and then upload the image on cloudinary and then save it inside our user details

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    //TODO: delete old image
    const oldAvatarUrl = await User.findById(req.user?._id)?.avatar
    // check this method also: oldAvatarUrl = getCurrentUser().avatar

    // got the url and now delete it
    const deleting = await cloudinary.uploader.destroy(oldAvatarUrl)

    if(!deleting){
        throw new ApiError(500, "Deletion from cloudinary failed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Failed to update avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image successfully updated.")
    )
    
})

// update cover image
const updateCoverImage = asyncHandler(async(req,res)=>{
    const userId = await User.findById(req.user?._id)
    const coverImageLocalPath = req.file?.path

    //Todo: delete from cloud

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(500, "Failed to update cover image on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "successfully updated cover image"))
})

// aggregation pipelines 

// get users subscribers and subscribedTo count

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "User is missing")
    }

    const channel = await User.aggregate([
        //filter the username from documents
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        // second pipeline
        // look inside all document's channels where this useIid is present
        /*The idea behind finding subscribers:
        For every subscribe a user hits new document is created which contains: {channel , subscriber(userId)}
        So, we will look for all documents where this user's channel is present and we will gwt our subscribers 
        Note:[we have not created an array for subscribers because it will be expensive for database queries when subscribers count hits a larger value.*/
        {
            
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            
        },
        // third pipeline
        // current user have subscribedTo
        // *subscriptions is our data model
        /* The idea behind finding number of channels subscribed to :
        for every user a document will be created for every subscription as prev. ,
        here we are looking for in how many docs this current user is present in as subscriber */
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        // join these fields in user model
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: { 
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                    
                }
            }
        },
        // display(project) what we want to send in user profile
        {
            $project: {
                fullName: 1,
                email: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                username: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400, "Channel not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

})

// get users watch history

const getWatchHistory = asyncHandler(async(req,res)=>{
    //why we are not using req.user?_id
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
    ])
    res.status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})
export  {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    updateUserAccountDetails,
    getUserChannelProfile,
    getWatchHistory
}