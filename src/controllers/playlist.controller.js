import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
   if(!name||!description){
    throw new ApiError(400, "Please provide all the required fields")
   }
    //TODO: create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    res.status(200)
    .json(new ApiResponse(200, playlist, "Successfully created playlist"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    //TODO: get user playlists
    const playlists = await Playlist.find({owner: userId})
    if(!playlists){
        throw new ApiError(404, "No playlists found")
    }
    res.status(200)
    .json(new ApiResponse(200, playlists, "successfully fetched playlist by user id"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlistId){
        throw new ApiError(404, "No playlist found")
    }
    res.status(200)
    .json(new ApiResponse(200, "Playlist fetched by ID"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId,videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
    }
    //TODO: add video to playlist
    const playlist = await Playlist.findOneAndUpdate({_id:playlistId, owner:req.user._id},
        {
            $push:{
                videos: videoId
            }
        },
        {new: true}
        
    )
    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }

    res.status(200)
    .json(new ApiResponse(200, playlist, "Successfully added video to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId,videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
    }
    const playlist = await Playlist.findOneAndUpdate({_id:playlistId, videos: videoId, owner: req.user._id},
        {
            $pull:{
                videos: videoId
            }
        },
        {new: true}
    )
    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }
    res.status(200)
    .json(new ApiResponse(200, playlist, "Successfully removed video from playlist"))
    


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
        }
    const playlist = await Playlist.findByIdAndDelete({_id: playlistId, owner: req.user._id})
    if(!playlist){  
        throw new ApiError(404, "No playlist found")
        }
    res.status(200)
    .json(new ApiResponse(200, {}, "Successfully deleted playlist"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400, "Name and description is required")
    }
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
        }
    const playlist = await Playlist.findByIdAndUpdate({
        _id: playlistId,
        owner: req.user._id

    },
    {
        $set:{
            name,
        description
        }
        
    },
    {new: true}
)
if(!playlist){
    throw new ApiError(404, "Playlist not found")
}

res.status(200)
.json(new ApiResponse(200, playlist, "Successfully updated playlist"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}


/* 
Test this function:

async function deletePlaylist(playlistId, userId) {
  // Start a transaction
  const session = await database.startSession();
  session.startTransaction();

  try {
    // Perform the delete operation within the transaction
    const playlist = await Playlist.findByIdAndDelete(
      { _id: playlistId, owner: userId },
      { session } // Pass the session to the operation
    );

    if (!playlist) {
      throw new Error("No playlist found");
    }

    // If everything is okay, commit the transaction
    await session.commitTransaction();
    return "Successfully deleted playlist";
  } catch (error) {
    // If there's an error, rollback the transaction
    await session.abortTransaction();
    throw error; // Rethrow or handle the error as needed
  } finally {
    // End the session
    session.endSession();
  }
}
*/