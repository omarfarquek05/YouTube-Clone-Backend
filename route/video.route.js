import express,{ Router } from 'express';
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus, 
    testvedio,
   }
 from "../controller/video.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"
import {upload} from "../middleware/multer.middleware.js"

const router = express.Router();

// Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT); 

router.route("/testvideo").get(testvedio);

// Upload vedio
router.route("/upload-vedio").post(upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );


// get all vedios
router.route("/videos").get(getAllVideos)

// get  vedio by ID
router.route("/video/:videoId").get(getVideoById)


// Update Video 
router.route("/update-video/:videoId").patch(updateVideo)

// Delete video
router.route("/delete-video/:videoId").delete(deleteVideo)

// Togglr publish video
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router

