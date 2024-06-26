import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
     //TODO: toggle like on video
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
     }
    const videoExists = await Video.findById(videoId)
    if(!videoExists){
        throw new ApiError(404,"Video not found")
    }
     let videoLike = await Like.findOne({video: videoId, likedBy: req.user._id})
    //  let message;
     if(videoLike){
        // delete the videolike by using mongoose document id identifies for videoLike
        await Like.deleteOne({_id: videoLike._id})
        // message = "Video unliked successfully"
    
    }
     else{
        await Like.create({
                video: videoId,
                likedBy: req.user._id
               });
        // message = "Video liked successfully"
     }

     const totalVideoLikes = await Like.countDocuments(videoLike)
    res.status(200)
    .json(new ApiResponse(200, totalVideoLikes, "Successfully updated video like"))
    
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
        }
    const commentExists = await Comment.findById(commentId)
    if(!commentExists){
        throw new ApiError(404,"Comment not found")
    }
    
    // let message;
    const commentLike = await Like.findOne({comment: commentId, likedBy: req.user._id})
    if(commentLike){
        // delete the commentlike by using mongoose document id identifies for commentLike
        await Like.deleteOne({_id: commentLike._id})
        // message = "Comment unliked successfully"
    }
    else{
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    }
    const totalCommentLikes = await Like.countDocuments(commentLike)
    res.status(200)
    .json(new ApiResponse(200, totalCommentLikes, "Successfully updated comment like"))

})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    const tweetLike = await Like.findOne({tweet: tweetId, likedBy: req.user._id})
    if(tweetLike){
        await Like.deleteOne({_id: tweetLike._id})
    }
    else{
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
    }
    const totalTweetLikes = Like.countDocuments(tweetLike)

    res.status(200)
    .json(new ApiResponse(200, totalTweetLikes, "Successfully updated tweets like"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get all liked videos
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
        }
    const allLikedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: req.user._id
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos"
            }
        },

        {
            $project: {
                likedVideos: 1
            }
        }

    ])

    res.status(200)
    .json(new ApiResponse(200, allLikedVideos, "successfully fetched liked Videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}