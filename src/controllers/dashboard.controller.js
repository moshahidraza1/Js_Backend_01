import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channel = await User.findById(req.user._id)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }
    // Aggregation in parallel, this will reduce query time
    const [totalVideos, totalLikes, totalSubscribers] = await Promise.all([
    Video.aggregate([
        {$match: {
            owner: req.user._id
        }},
        {
            $group:{
                _id:null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"}
            },
           
        }
    ]),

    Like.aggregate([
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $match: {
                "videoDetails.owner": req.user._id
            }
        },
        {
            $group:{
                _id:null,
                totalLikes: {$sum: 1}
            }
        }
    ]),

    Subscription.countDocuments({channel: req.user._id})
])



    const stats = {
        totalVideos: totalVideos[0]?.totalVideos|| 0,
        totalViews: totalVideos[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        totalSubscribers: totalSubscribers||0
    }
    res.status(200)
    .json(new ApiResponse(200, {stats},"Successfully fetched Channel stats"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channel = await User.findById(req.user._id)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }
    const videos = await Video.find({owner: req.user._id}).sort({createdAt: -1})

    res.status(200)
    .json(new ApiResponse(200, {videos},"Successfully fetched Channel videos"));


})

export {
    getChannelStats, 
    getChannelVideos
    }