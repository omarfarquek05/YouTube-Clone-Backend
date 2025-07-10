import { Router } from 'express';
import {
    testComment,
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controller/comment.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// test a Comment
router.route("/test-comment").get(testComment);

// Post a Comment
router.route("/add-comment/:videoId").post(addComment);

// Get Comments
router.route("/get-comments/:videoId").get(getVideoComments)

// Update Comment
router.route("/update-comment/:commentId").patch(updateComment);
    
// Delete Comment
router.route("/delete-comment/:commentId").delete(deleteComment)


export default router
