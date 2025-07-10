import { Router } from 'express';
import {
     testLike,
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
} from "../controller/like.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// test a Comment
router.route("/test-like").get(testLike);

// Toggle video like route
router.route("/toggle/video/:videoId").post(toggleVideoLike);

// Toggle comment like route
router.route("/toggle/comment/:commentId").post(toggleCommentLike);

// Get Liked video route
router.route("/liked-videos").get(getLikedVideos);

export default router;
