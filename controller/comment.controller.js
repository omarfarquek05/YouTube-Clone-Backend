import mongoose, {isValidObjectId} from "mongoose"
import Comment from "../model/comment.model.js"
import Video from "../model/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


// teste function
const testComment = asyncHandler(async (req, res) => {
  res.status(200).json(200,"Test Comment is working");
});

// Todo: Add Comment
//Extract data from the request
// Get videoId from req.params
// Get text (comment body) from req.body
// Get user from req.user (assuming authenticated middleware adds it)
// Validate input
// Ensure videoId is a valid ObjectId
// Ensure text is not empty
// Find the video
// Check if the video exists in the database
// Create and save the comment
// Create a new comment with the text, video reference, and user (author)
// Send response
// Return 201 Created with the newly added comment

// Add Comment
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {  content } = req.body;
    const userId = req.user?._id;

    // Validate input
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    // Create and save comment
    const comment = await Comment.create({
        content,
        video: videoId,
        user: userId
    });

    return res.status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
})

// Todo: Get all Comment
// Extract videoId, page, and limit from req.params and req.query.
// Validate the videoId using mongoose.Types.ObjectId.isValid() to ensure it’s a proper MongoDB ObjectId.
// (Optional but recommended): Check if the video exists in the database. If not, return a 404 error.
// Create an aggregation pipeline:
// Use $match to filter comments for the given videoId.
// Use $lookup to join the users collection to fetch comment author info.
// Use $unwind to flatten the authorInfo array.
// Use $project to structure the returned comment fields.
// Use $sort to return the latest comments first.
// Use aggregatePaginate from mongoose-aggregate-paginate-v2:
// Pass the aggregation pipeline and pagination options (page, limit).
// Get paginated comment results.
// Return the response with:
// Paginated comment data
// Message indicating success

// Get All Comments
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // 1. Validate videoId
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // 2. Optional: check if video exists
    const videoExists = await Video.exists({ _id: videoId });
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // 3. Build aggregation pipeline
    const aggregation = [
        { $match: { video: mongoose.Types.ObjectId.createFromHexString(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        { $unwind: "$ownerInfo" }, // convert array to single object inwind 
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerInfo._id",
                    username: "$ownerInfo.username",
                    email: "$ownerInfo.email"
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ];

    // 4. Paginate using mongoose-aggregate-paginate-v2
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const result = await Comment.aggregatePaginate(Comment.aggregate(aggregation), options);

    return res.status(200).json(
        new ApiResponse(200, result, "Comments fetched successfully")
    );
})

// Todo: update Comment
// Takes commentId from the route params (/update-comment/:commentId)
// Takes new content from the request body.
// Validates the commentId and content
// Uses findByIdAndUpdate() to update the content
// Returns the updated comment to the client.

// update comment
const updateComment = asyncHandler(async (req, res) => {
   const { commentId } = req.params;
  const { content } = req.body;

  // 1️⃣ Validate commentId
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  // 2️⃣ Validate content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  // 3️⃣ Find and update the comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true } // Return the updated document
  );

  // 4️⃣ Check if comment exists
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }

  // 5️⃣ Return response
  return res.status(200).json(
    new ApiResponse(200, updatedComment, "Comment updated successfully")
  );
})


// Todo: delete Comment
// Input: The commentId is received from the URL.
// Validation: It checks if the ID is valid using Mongoose’s ObjectId.isValid.
// Deletion: It deletes the comment using findByIdAndDelete.
// Error Handling: If no comment is found, a 404 error is returned.
// Success: Returns the deleted comment and success message.

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
       
    //Find and delete the comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    // 3️⃣ If comment not found
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
    }
  
    return res.status(200)
          .json( new ApiResponse(200, deleteComment, "Comment deleted successfully"))

})

export {
    testComment,
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
    
