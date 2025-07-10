import mongoose from "mongoose"
import Video from "../model/video.model.js"
import Subscription from "../model/subscription.model.js"
import Like from "../model/like.model.js"
import User from "../model/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

//Todo:
// Total number of videos uploaded by the user.
// Total number of views (sum of all video views).
// Total number of likes (from the Like model).
// Total number of subscribers.

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id; // Assuming user is authenticated

    // 1. Total Videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // 2. Total Views
    const videoStats = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = videoStats[0]?.totalViews || 0;

    // 3. Total Likes on videos
    const totalLikes = await Like.countDocuments({
        likedBy: { $exists: true },
        video: { $ne: null },
    });

    // 4. Total Subscribers
    const user = await User.findById(userId).select("subscribers");
    const totalSubscribers = user?.subscribers?.length || 0;

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalLikes,
            totalSubscribers,
        }, "Channel statistics fetched successfully")
    );
})

// Todo :
// req.user._id: Gets the logged-in user's ID (channel owner).
// page and limit: Used for pagination.
// Video.find({ owner: userId }): Gets all videos uploaded by this user.
// .sort({ createdAt: -1 }): Sorts videos by latest first.
// .skip() and .limit(): Used for paginated result.
// Also returns totalVideos and totalPages for frontend navigation.

const getChannelVideos = asyncHandler(async (req, res) => {
   const userId = req.user._id; // Get channel owner's ID (assumes user is authenticated)

    const { page = 1, limit = 10 } = req.query;

    // Get all videos uploaded by the user with pagination
    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 }) // most recent first
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments({ owner: userId });

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalVideos / limit),
            videos
        }, "Channel videos fetched successfully")
    );
})

export {
    getChannelStats, 
    getChannelVideos
    }