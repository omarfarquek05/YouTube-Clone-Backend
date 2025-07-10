import mongoose, {isValidObjectId} from "mongoose"
import User from "../model/user.model.js"
import Subscription from "../model/subscription.model.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


// teste function
const testsubscription = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test api is working",
  });
});

// TODO steps:
// Get channelId from req.params.
// Get userId from req.user (authenticated user).
// Validate channelId to ensure it is a valid MongoDB ObjectId
// Check if the channel (User) exists in the database using User.findById(channelId).
// Find existing subscription in the Subscription model using subscriber: userId and channel: channelId.
// If a subscription exists:
// Delete the existing subscription (unsubscribe).
// Return a success response for unsubscription.
// If no subscription exists:
// Create a new subscription document with subscriber and channel.
// Return a success response for subscription

// controller to return subscriber list of a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log("channel ID is:", channelId)

    const userId = req.user._id;
    console.log("user id is :", userId)
    
     if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    
    // find the user
    const channel = await User.findById(channelId);
     console.log("channel is :", channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

  // check the subscription exist yes or not!
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        // if user has subscription already then delete subscription or unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        // if user has no subscription then subscribe 
        await Subscription.create({
            subscriber: userId,
            channel: channelId,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, null, "Subscribed successfully"));
    }

})

// Todo :
// Get channelId from req.params.
// Validate that channelId is a valid MongoDB ObjectId.
// Check if the channel (User) with the given ID exists in the database.
// Fetch all subscription documents from the Subscription model where channel === channelId.
// Extract subscriber user IDs from the subscription records.
// Query the User model to get full user info of those subscriber IDs.
// Return the subscriber list as a JSON response.

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
     const { channelId } = req.params;

    // 1. চেক করব channelId valid ObjectId কিনা
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // 2. চ্যানেল (ইউজার) এক্সিস্ট করে কিনা দেখব
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // 3. Subscription টেবিল থেকে এই চ্যানেলের সব subscriber বের করব
    const subscriptions = await Subscription.find({ channel: channelId });

    // 4. শুধু subscriber userId গুলো বের করব
    const subscriberIds = subscriptions.map(sub => sub.subscriber);

    // 5. User টেবিল থেকে তাদের ডিটেইলস বের করব
    const subscribers = await User.find({ _id: { $in: subscriberIds } })
        .select("username fullName avatar");

    // 6. রেসপন্সে পাঠিয়ে দিব
    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Channel subscriber list"));
})

// Get subscriberId from request parameters.
// Validate if subscriberId is a valid MongoDB ObjectId.
// Query the Subscription collection to find all subscriptions where subscriber equals subscriberId.
// From the subscriptions found, extract the channel IDs.
// Fetch user/channel details for these channel IDs from the User collection.
// Return the list of subscribed channels to the client.

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    // ১. subscriberId ভ্যালিড কিনা চেক করবো
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // ২. Subscription থেকে সব সাবস্ক্রিপশন খুঁজবো যেখানে subscriber=subscriberId
    const subscriptions = await Subscription.find({ subscriber: subscriberId });

    // ৩. channel আইডিগুলো বের করবো
    const channelIds = subscriptions.map(sub => sub.channel);

    // ৪. User collection থেকে channel এর ডিটেইলস নিয়ে আসবো
    const channels = await User.find({ _id: { $in: channelIds } }).select('-password'); // password বাদ দিয়ে আনছি

    // ৫. ক্লায়েন্টকে রেসপন্স দিবো
    return res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    testsubscription,
}

{/*
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
    
*/}
