// next i have to complete this part 
import { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments= asyncHandler(async(req, res)=>{
    // TODO: get all comments for a video
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const {page=1, limit = 10} = req.query
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const comments = await Comment.find({video: videoId})
                                .sort({createdAt:-1})
                                .skip((parseInt(page)-1)*parseInt(limit))
                                .limit(parseInt(limit))
    
    if(comments.length === 0){
        return res.status(200)
        .json(new ApiResponse(200, {}, "No comments found for this video"))
    }
    return res.status(200)
    .json(new ApiResponse(200, comments, "Successfully fetched comments."))

})

const addComment = asyncHandler(async(req,res)=>{
    // TODO: add a comment to a video
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const {content} = req.body;
    if(!content){
        throw new ApiError(400, "Content field is required to add a comment")
    }
    const comment =await Comment.create({
        content,
        video: videoId,
        owner: req.user._id

    })
    return res.status(201)
    .json(new ApiResponse(201, comment, "Successfully added comment"))

})

const updateComment = asyncHandler(async(req,res)=>{
    // TODO: update a comment
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }
    const {content} = req.body
    if(!content){
        throw new ApiError(400, "Comment field is required")
    }
    const comment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content
        }
    },
    {new: true}
    )

    res.status(200)
    .json( new ApiResponse(200, comment, "Successfully updated comment"))
})


const deleteComment = asyncHandler(async(req,res)=>{
    // TODO: delete a comment
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
        }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "comment Id not found")
    }
    await Comment.findByIdAndDelete(commentId)

    res.status(200)
    .json( new ApiResponse(200, {}, "successfully deleted the comment"))
})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}