import express,{Router} from 'express';
import {verifyJWT} from "../middleware/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers,
    testsubscription, getSubscribedChannels} from "../controller/subscription.controller.js"


// Add your user routes here
 const router = Router();

 // Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT); 

//test
router.get("/test", testsubscription);

// Get list of subscribed channels for a user
router.get("/subscribed-channels/:subscriberId", getSubscribedChannels);

// Subscribe or unsubscribe from a channel
router.post("/c/:channelId", toggleSubscription);


// router
//     .route("/c/:channelId")
//     .get(getSubscribedChannels)
//     .post(toggleSubscription);

router.route("/user-channel/:channelId").get(getUserChannelSubscribers);

export default router;
