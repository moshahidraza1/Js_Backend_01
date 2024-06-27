import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400, "Tweet text is required")
    }
    const userId = await User.findById(req.user._id)
    if(!userId){
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id,
    })
    res.status(200)
    .json(200, tweet, "Successfully created tweet")
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
        }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    
    const tweets = await Tweet.find({owner: userId})
    res.status(200)
    .json(new ApiResponse(200, tweets, "successfully retrieved user tweets"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }
    const {content} = req.body
    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id

    },
     {
        $set:{
            content: content,
        }
       

    },
    {new: true}
)
if(!tweet){
    throw new ApiError(404, "Tweet not found")
}
res.status(200)
.json(new ApiResponse(200, tweet, "successfully updated tweet"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }
    const tweet = await Tweet.findOneAndDelete({_id: tweetId, owner: req.user._id})

    res.status(200)
    .json(new ApiResponse(200, {}, "Successfully deleted tweet"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}