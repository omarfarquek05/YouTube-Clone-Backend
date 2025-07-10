
import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../model/playlist.model.js"
import Video from "../model/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


// teste function
const testPlaylist = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test api platlist is working",
  });
});

// Todo: create playlist
// Get user from request (authentication)
// Extract the currently logged-in user’s ID from req.user.
// Validate input
// Check if name and description are provided.
// Create a new playlist instance
// Create a new document using the Playlist model with name, description, owner.
// Save the playlist to the database
// Send a success response
// Return the newly created playlist in the response with a 201 Created status.

// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    
    if (!name || !description) {
        throw new ApiError(400, "name or description are required")
    }
   
    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(400, "Unauthorized. User not found.")
    }
     
    // 3. Create a new playlist instance 
    const playlist = new Playlist({
        name,
        description,
        owner,  // set the current user as the owner (owner : owner)
        videos: [] // optional: start with an empty video list
    })

    await playlist.save();

    return res.status(201)
        .json(new ApiResponse(201, playlist, "New playlist Created Successfully"))
})
    
// TODO : Get User Playlist 
// Extract userId from req.params
// Find playlists where owner matches userId
// Optionally populate related fields like videos or owner (if needed)
// Return the list of playlists in the response

// Get User Playlist 
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }

    // Find playlists owned by the user
    const platlists = await Playlist.find({ owner: userId }).populate('videos')
    
    return res.status(200)
    .json(new ApiResponse(200, platlists, "User playlists fetched successfully"))
   
})

// Todo: Get Playlist By ID
//Extract playlistId from req.params.
//Validate the ID format if needed (optional, especially if using MongoDB).
//Use Playlist.findById() to retrieve the playlist from the database.
//Populate related data (e.g., videos, owner) if needed.
//If not found, return 404.
//Return the playlist in the response.


// Get Playlist By ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    // Validate playlist ID
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    // Find playlist by ID and populate videos and owner
    const playlist = await Playlist.findById(playlistId)
        .populate("videos")  // optional: populate video details
        .populate("owner", "name email");  // optional: populate owner details (e.g., name, email)

    // 3. Check if playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    } 

    return res.status(200)
            .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})


// Todo: Edit Playlist
// Extract playlistId from request parameters
// Get the ID of the playlist that needs to be updated.
// Extract name and description from request body
// Get the new values the user wants to update.
// Validate the playlistId
// Check if the ID exists and is a valid MongoDB ObjectId.
// If invalid, throw a 400 Bad Request error.
// Validate input fields
// Ensure at least one of name or description is provided in the request body.
// If both are missing, throw a 400 Bad Request error.
// Update the playlist in the database
// Use Playlist.findByIdAndUpdate() to update the playlist.
// Only include name or description if they are provided.
// Use { new: true } to return the updated document.
// Check if playlist exists
// If no playlist is found with the given ID, throw a 404 Not Found error.
// Send success response
// Return status 200 with the updated playlist and a success message.

// Edit Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Id is Invalid")
    }

    const { name, description } = req.body
    
    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update");
    }
    
    //Find and update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, {
            //if name is truthy then update otherwise falsy and skip it
        ...(name && { name }),
        ...(description && { description })
    },
        { new: true }
    );

    if (!updatePlaylist) {
         throw new ApiError(404, "Playlist not found");
    }

    return res.status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));

})

// Todo: Delete Play List 
// Extract playlistId from request parameters
// Identify which playlist the user wants to delete.
// Validate the playlistId
// Ensure the ID exists and is a valid MongoDB ObjectId.
// If invalid, return a 400 Bad Request error.
// Find and delete the playlist
// Use Playlist.findByIdAndDelete() to remove the playlist from the database.
// Handle playlist not found
// If the playlist doesn't exist, return a 404 Not Found error.
// Return success response

// Respond with a 200 OK and a success message.

// Delete Play List 
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    // 2. Find and delete the playlist
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletePlaylist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res.status(200)
              .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
  
})  

//Todo: Add Video To the Playlist
// Extract playlistId and videoId from req.params.
// Check if both IDs are provided.
// Validate that both playlist and video exist.
// Check if the video already exists in the playlist.
// Add the videoId to the playlist.videos array.
// Save the updated playlist.
// Respond with a success message and updated playlist.

// Add Video To the Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    // Validate IDs
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // 2. Find playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
       throw new ApiError(400, "Playlist not found");
    }

    // 3. Find video by ID (optional but recommended to ensure it exists)
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
         throw new ApiError(400, " Video not found");
    }

    // 4. Check if video is already in playlist
    const alreadyAdded = playlist.videos.includes(videoId);
    if (alreadyAdded) {
        throw new ApiError(400, "Video already in playlist");
    }

    // 5. Add video to playlist
    playlist.videos.push(videoId);
    await playlist.save();

    // 6. Respond with updated playlist
    res.status(200).json(new ApiResponse(200,  playlist, "Video added to playlist successfully"));
})


//Todo: Delete video from the play list
// Extract playlistId and videoId from req.params.
// Check if both IDs are provided.
// Find the playlist by ID.
// Check if the video exists in the playlist
// Remove the video from the playlist.videos array.
// Save the updated playlist.
// Return a success response.

// Delete video from the play list
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    // console.log("play list id is req params :", playlistId)
    // console.log("video id is :", videoId)
    
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    // Find The play list
    const playlist = await Playlist.findById(playlistId);
    //console.log("playlist id is :", playlist)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if video exists in playlist
    const videoIndex = await playlist.videos.indexOf(videoId)

    if (videoIndex === -1) {
         throw new ApiError(400, "Video not found in playlist")
    }

    // 4. Remove video from playlist
    playlist.videos.splice(videoIndex, 1)
    await playlist.save();

    return res.status(200)
               .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))

})






export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    testPlaylist,
}
    