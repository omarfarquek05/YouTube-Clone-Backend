import mongoose, {isValidObjectId} from "mongoose"
import User from "../model/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import {deleteFromCloudinary} from "../utils/cloudinary.js"
import Video from "../model/video.model.js"


// teste function
const testvedio = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test api is working",
  });
});

// Publish  Video
// Get title, description, and duration from req.body
//  Validate that all required fields are present
//  Get video and thumbnail file paths from req.files (uploaded via Multer)
//  Check if video and thumbnail files exist
//  Upload video and thumbnail to Cloudinary
//  Check if uploads were successful (received secure_url)
//  Create a new Video document in the database
//  Attach the currently logged-in user as the owner
//  Send a success response with status 201 and the created video

const publishAVideo = asyncHandler(async(req, res) => {

    const {title, description, duration } = req.body

    if(![title, description, duration].every(Boolean)) {
          throw new ApiError(401, "Title, description, and duration are required")
    }

    //console.log("req files is :",req.files)

    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    //console.log("videoFile LocalPath is :", videoFileLocalPath)

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    //console.log("thumbnailL LocalPath is :", thumbnailLocalPath)

    if(!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "Video File local path or thumbnail local path is required")
    }

    
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    // console.log("videoFile from cloudinary is :", videoFile)


    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
     //console.log("thumbnailL from cloudinary is :", thumbnail)

     if(!videoFile?.secure_url || !thumbnail?.secure_url) {
             throw new ApiError(500, "failed To Upload vedio or thumbnail")
        }

      const video = await Vedio.create({
           videoFile : {
              secure_url: videoFile.secure_url,
              public_id : videoFile.public_id
           },
           thumbnail : {
            secure_url : thumbnail.secure_url,
            public_id : thumbnail.public_id
           },
           title, 
           description, 
           duration, 
           owner: req.user._id
      })
       
      return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );

})

// Extract query parameters from the request:
// page, limit, query, sortBy, sortType, and userId.
// Create a filter object:
// If a query is provided, use a $regex search to filter videos by matching title or description.
// If a valid userId is provided, add it to the filter to get videos by that specific user.
// Create a sort object:
// Set the sorting field and direction (asc for ascending, desc for descending).
// Default is sorting by createdAt in descending order.
// Initialize an aggregation pipeline using Vedio.aggregate():
// Start with a $match stage using the filter object.
// Apply sorting to the aggregation:
// If the sort object is not empty, apply .sort() to the pipeline.
// Set pagination options:
// Convert page and limit values from string to integers.
// Use aggregatePaginate() to fetch the paginated result based on filter, sort, and page.
// Send the response:
// Return a 200 OK status with the paginated result and a success message.

// Get All Videos
const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, userId, sortBy = "createdAt", sortType = "desc" } = req.query;

    const filter = {};
    if(query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" }},
            { description: { $regex: query, $options: "i" }},
        ]
    }

    if(userId && mongoose.isValidObjectId(userId)) {
         filter.owner = userId
    }

    // this is using for sorting mongo db documents 
    const sort = {};
    // sortBy = createdAt or title and sortType = asc or desc aslo sort[sortBy] accesing dynamic object using array notation[]
       if(sortBy) {
           sort[sortBy] = sortType === "asc" ? 1 : -1;
     }
     
     // use aggregate for pagination using Vedio model
     const aggregate = Vedio.aggregate([{ $match : filter }]);

     if(Object.keys(sort).length) {
        aggregate.sort(sort)
     }

     // options  
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const result = await Vedio.aggregatePaginate(aggregate, options);

    return res.status(200).json( 
        new ApiResponse(200, result, "Videos fetched successfully")
    )
})

// Extract video ID from the request parameters (req.params).
// Validate the ID to make sure it is a valid MongoDB ObjectId.
// Find the video by ID using Mongoose.
// If video not found, return a 404 Not Found error.
// If video found, return the video data with a success response.
// Get Single Video By Id 
const getVideoById = asyncHandler(async(req, res) => {
    //here mongo db _id is video id 
    const {videoId} = req.params

    //mongoose.Types.ObjectId.isValid(videoId)
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
       throw new ApiError(401, "videoId is Invalid")
    }

    const video = await Vedio.findById(videoId)

    if (!video) {
    throw new ApiError(404, "Video not found");
}
   
return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
);

})

// Extract videoId from route params.
// Validate the videoId using Mongoose ObjectId.
// Find the video document from the database using videoId.
// If not found, throw 404 error.
// Destructure new data (title, description, duration) from req.body.
// Update existing fields conditionally if provided.
// Check if a new video file was uploaded
// Delete old video from Cloudinary if exists.
// Upload new video and update document fields.
// Check if a new thumbnail was uploaded:
// Delete old thumbnail from Cloudinary if exists.
// Upload new thumbnail and update document fields.
// Save the updated video document to DB.
// Send success response with updated video.

// Update  Video
const updateVideo = asyncHandler(async(req, res) => {
       const {videoId} = req.params;

       if(!mongoose.Types.ObjectId.isValid(videoId)) {
         throw new ApiError(401, "Video Is Invalid")
       }

       const video = await Video.findById(videoId);
         if (!video) {
              throw new ApiError(404, "Video not found");
     }
    
    // option:1         
    // const {title, description, duration} = req.body;
    // if (title) video.title = title;
    // if (description) video.description = description;
    // if (duration) video.duration = duration;

// option : 2 use here looping directly key value update 
    // Object.keys(req.body).forEach(([key, value]) => {
    //     if(["title", "description", "duration"].includes(key) && value) {
    //         video[key] = value
    //     }
    // })
   if (req.body && typeof req.body === 'object') {
  Object.entries(req.body).forEach(([key, value]) => {
    if (["title", "description", "duration"].includes(key) && value) {
      video[key] = value;
    }
  });
}


// Check if a new video file was uploaded
   const newVideoFilePath = req.files?.videoFile?.[0]?.path;
    console.log("new video file path is : ", newVideoFilePath)

   const newThumbnailFilePath = req.files?.thumbnail?.[0]?.path;
     console.log("new thumbnail file path is : " , newThumbnailFilePath)

     if(newVideoFilePath) {
        if(video.videoFile?.public_id) {
            await deleteFromCloudinary(video.videoFile.public_id)
        }
         const uploadedVideo = await uploadOnCloudinary(newVideoFilePath);
            video.videoFile = {
                secure_url : uploadedVideo.secure_url,
                public_id : uploadedVideo.public_id
            }
     }

     // This part for Thumbnail 
     if(newThumbnailFilePath) {
         if(video.thumbnail?.public_id){
            await deleteFromCloudinary(video.thumbnail.public_id)
         }
         const uploadedThumbnail = await uploadOnCloudinary(newThumbnailFilePath)
           video.thumbnail = {
              secure_url : uploadedThumbnail.secure_url,
              public_id : uploadedThumbnail.public_id
           }
     }

        //save the video 
        await video.save();

 return res.status(200).json(
     new ApiResponse(200, video, "Video updated successfully")
    );
       
})

// Todo algo
// Get videoId from request parameters.
// Validate if videoId is a valid MongoDB ObjectId.
// Find the video by ID in the database.
// If the video does not exist, return 404 error.
// If the video contains uploaded videoFile or thumbnail:
// Call deleteFromCloudinary using their public_id.
// Delete the video from the database.
// Return success response.

// Delete  Video
const deleteVideo = asyncHandler(async(req, res) => {
     const {videoId} = req.params

     if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
     }

     const video = await Video.findById(videoId)

     if(!video) {
        throw new ApiError(401, "vido is not found by this id")
     }
      
   // Step 3: Delete video file from Cloudinary
   if(video.videoFile?.public_id) {
     await deleteFromCloudinary(video.videoFile.public_id)
   }

   // Delete thumbnail from cloudinary
   if(video.thumbnail?.public_id){
    await deleteFromCloudinary(video.thumbnail.public_id)
   }

// Step 5: Delete video from DB
await Video.findByIdAndDelete(videoId);

return res.status(201).json(new ApiResponse(200, {}, "Video deleted successfully"))

})


// ToDo :  Algo 
// .patch(upload.single("thumbnail"), updateVideo);
// Get the videoId from req.params.
// Validate if videoId is a valid MongoDB ObjectId
// Find the video by ID in the database.
// If the video is not found, return a 404 error.
// Toggle the isPublished field:
// If true, make it false.
// If false, make it true.
// Save the updated video document.
// Return a success response with the new publish status.

// Toggle Publish Status 
const togglePublishStatus = asyncHandler(async(req, res) => {
       const {videoId} = req.params

       if(!mongoose.Types.ObjectId.isValid(videoId)) {
         throw new ApiError(401, "vido id is invalid")
       }

       const video = await Video.findById(videoId)

       if(!video) {
        throw new ApiError(401, "Video is not Found by This id")
       }

       // Toggle Publish Video Status
       video.isPublished = !video.isPublished;

       // Save to db
       await video.save();

       return res.status(201).json(new ApiResponse(201, video, 
            `video has been ${video.isPublished ? "published" : "unpublished" } successfully`
    ))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    testvedio,
}


