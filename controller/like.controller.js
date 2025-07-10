import mongoose, {isValidObjectId} from "mongoose"
import Like from "../model/like.model.js"
import Video from "../model/video.model.js"
import Comment from "../model/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


// Toggle Video Like 
const testLike = asyncHandler(async (req, res) => {
    res.status(200).json(200,"Test Like is working");
})


// Todo:
// 1. Validate the video ID
// 2. Ensure the video exists in DB
// 3. Check if like already exists
//    → If exists: Unlike (remove from Like model)
//    → If not: Create a new Like entry
// 4. Return appropriate success response

// Toggle Video Like 
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id; // Assuming user is authenticated and req.user is populated

    // ✅ 1. Validate videoId
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // ✅ 2. Check if video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // ✅ 3. Check if user already liked the video
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });
       
    if (existingLike) {
        // ✅ 4. If already liked, remove the like (Unlike)
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json( new ApiResponse(200, null, "Video UnLiked Successfully"))
        
    } else {
        // ✅ 5. If not liked yet, create a new like
        await Like.create({
            video: videoId,
            likedBy: userId,
        });
        return res.status(201).json( new ApiResponse(201, null, "video Liked Successfully"))
    }

})

// Todo:
// 1. Validate the comment ID
// 2. Ensure the comment exists in DB
// 3. Check if like already exists
//    → If exists: Unlike (remove from Like model)
//    → If not: Create a new Like entry
// 4. Return appropriate success response


// Toggle Comment Like 
const toggleCommentLike = asyncHandler(async (req, res) => {
      const { commentId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated

    // ✅ 1. Validate comment ID
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    // ✅ 2. Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // ✅ 3. Check if user already liked the comment
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // ✅ 4. If already liked, remove the like (Unlike)
        await Like.deleteOne({ _id: existingLike._id });
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    // ✅ 5. If not liked yet, create a new like
    await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, null, "Comment liked successfully"));
})

// Todo:
// 1. Get the currently logged-in user's ID
// 2. Query the Like model to find all entries where:
//    - likedBy = userId
//    - video is not null (i.e., it is a video like, not comment/tweet)
// 3. Use populate to get full video info
// 4. Return the list of liked videos

// Get Liked Videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id // Assuming user is authenticated

    if (!userId) {
        throw new ApiError(400, "User ID not found")
    }

    // 1. Find all likes where user liked a video (not comment)
    const likes = await Like.find({ likedBy: userId, video: { $ne: null } })  // $ne means “not equal to null
        .populate("video") // populate video details
        .sort({ createdAt: -1 }) // sort by newest liked first
        
    // 2. Extract videos from like objects
    const likedVideos = likes.map(Like => Like.video);

    return res.status(200)
        .json(new ApiResponse(200, likedVideos, "liked videos Fetched successfully"))
})

export {
    testLike,
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}

    
