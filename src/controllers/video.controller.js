import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import {Video} from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async(req,res)=>{
    const {page = 1, limit = 10, query='', sortBy = 'createdAt', sortType='desc', userId} = req.query
    //TODO: get all videos based on query, sort, pagination


    // $regex in mongo is used for matching strings and options is used to ignore case sensitivity
    const match ={}
    if (query) {
        match.title = { $regex: query, $options: 'i'};
    }
    if(userId){
        match.owner = mongoose.Types.ObjectId(userId)
    }
    const sort = {}
    //sortBy expects a string like 'title', sortType can be asc or desc 
    // sortType === 1 then value will be 1 else assign -1 for descending
    sort[sortBy]= sortType === 'asc' ? 1 : -1
    const videos = await Video.aggregate([
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner'
                        }
                    },
                    {$unwind: 'owner'},
                    {
                        $match: {
                            $or:[
                                {match},
                                {'owner.username': {$regex: query, $options: 'i'} },
                                {'owner.fullName': {$regex: `.*${query}.*`, $options:'i'}}
                            ]
                        }
                    },
                    {
                        
                        $sort: sort
                    },
                    {
                        $skip: (parseInt(page) - 1) * parseInt(limit)
                    },
                    {
                        $limit: parseInt(limit)
                    },
                    {
                        $group: {
                            _id: null,
                            data: {$push: "$$ROOT"},
                            totalCount: {$sum: 1}
                        }
                    },
                    {
                        $project: {
                            data: {
                                $slice: ['$data', 0 , parseInt(limit)]
                            },
                            totalCount: 1
                        }
                    }
                
        
    ])
    const result = videos[0] || {data: [], totalCount: 0}
    // if we have value inside total then get that value else assign 0
    // const totalCount = filter.total[0]? filter.total[0].count:0

    res.status(200)
    .json(new ApiResponse(200, result, "Successfully filtered videos" ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title || !description){
        throw new ApiError(400, "Title and description are required")
    }
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Video and thumbnail are required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400, "video uploading failed on cloudinary")

    }
    if(!thumbnail){
        throw new ApiError(400, "Thumbnail uploading failed on cloudinary")
    }
    // what if we want to return user as owner as well
    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        videoFile: videoFile.url,
        owner: req.user._id
    })
    res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully" ))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(401, "Invalid videoId")
    }
    // TODO: also get the duration of video
    res.status(200)
    .json(new ApiResponse(200, video, "Video fetched from videoId successfully"))
})
// may be save method needs to be updated
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const deleteThumbnailUrl = video.thumbnail
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Invalid thumbnail for update")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500, "Thumbnail uploading failed on cloudinary")
    }
    await deleteFromCloudinary(deleteThumbnailUrl)

    
    video.thumbnail = thumbnail.url
    // const video = await Video.findByIdAndUpdate(videoId,
    //     {
    //         $set: {
    //             title,
    //             description,
    //             thumbnail: thumbnail.url
    //         }
    //     },
    //     {new:true}
    // )
    video.title = title;
    video.description = description;
    await video.save();

    res.status(200)
    .json( new ApiResponse(200, video, "Successfully updated video details"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(401, "Invalid videoId")
    }
    const videoUrl = video.videoFile
    const thumbnail = video.thumbnail
    //TODO: delete video

    // findByIdAndRemove is not a valid function anymore
    await Video.findByIdAndDelete(videoId)
    //TODO: delete video from cloudinary
    const deleteVideoFromCloudinary = await deleteFromCloudinary(videoUrl)
    const deleteThumbnailFromCloudinary = await deleteFromCloudinary(thumbnail)

    if(!deleteVideoFromCloudinary || !deleteThumbnailFromCloudinary){
        throw new ApiError(500, "Error while deleting thumbnail and video from cloudinary")
    }

    res.status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(401, "Video not found")
        }
    video.isPublished = !video.isPublished
    await video.save()

    res.status(200)
    .json(new ApiResponse(200, video, "Published dtstus toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}