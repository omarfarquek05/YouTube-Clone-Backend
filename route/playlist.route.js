
import { Router } from 'express';
import {
    addVideoToPlaylist,
     createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
    testPlaylist,
} from "../controller/playlist.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Test 
router.route("/test").get(testPlaylist)

// create playlist
router.route("/create").post(createPlaylist)

// Get all playlist
router.route("/my-allplaylist/:userId").get(getUserPlaylists)

// Get playlist By ID
router.route("/my-playlist/:playlistId").get(getPlaylistById)

// Update playlist By ID
router.route("/update/my-playlist/:playlistId").patch(updatePlaylist)

// Delete playlist By ID
router.route("/delete/my-playlist/:playlistId").delete(deletePlaylist)

// Add  video to the playlist 
router.route("/add-video/:videoId/:playlistId").patch(addVideoToPlaylist)

// remove video to the playlist 
router.route("/remove-video/:playlistId/:videoId/").delete(removeVideoFromPlaylist);



export default router  

{/*
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router    
    
*/}