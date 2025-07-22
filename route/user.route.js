import {Router} from 'express';
import { upload } from "../middleware/multer.middleware.js"
import { limiter, limiterWithRedis } from '../middleware/lateLimitor.middleware.js';
import {verifyJWT} from "../middleware/auth.middleware.js"
import { testeApi,registerUser, generateAccessAndRefereshTokens, 
          loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,
          getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,
          getWatchHistory, getUserChannelProfile,sendOtpToUser,resetPassword,
         } 
           from '../controller/user.controller.js';


// Add your user routes here
 const router = Router();

 //test api
 router.route("/test").get(testeApi);

 // register route
 router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }
    ]),
    registerUser
 )

//Signin route
router.route("/login").post(loginUser)

//logout user
router.route("/logout").post(verifyJWT, logoutUser)

//Access Token Refresh url
router.route("/refresh-token").post(refreshAccessToken)

// Forget password and send otp in email and also used late limiting
router.post("/forgot-password",  limiter, sendOtpToUser); 

// Todo : resetPassword
// Reset password 
router.post("/reset-password", resetPassword); 

// Change current password and limiter with redis 
router.route("/change-password").post( verifyJWT , limiterWithRedis, changeCurrentPassword)

// Get Current user
router.route("/current-user").get(verifyJWT, getCurrentUser)

// Upadte account Details
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// Upadte User Avatar
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

// Upadte User Cover Image
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// Get User Channel Profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

// Get User Watch History
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;

