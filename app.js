import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./route/user.route.js"
import subscriptionRouter from "./route/subscription.route.js"
import videoRouter from "./route/video.route.js"
import playlistRouter from "./route/playlist.route.js"
import CommentRouter from "./route/comment.route.js"
import likeRouter from "./route/like.route.js"
import dashboardRouter from "./route/dashboard.routes.js"
import dotenv from "dotenv";

dotenv.config();

const app = express()

//middleware 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Route declaration  
app.use("/api/v1/users", userRouter)

//  video Route
app.use("/api/v1/video", videoRouter)

// subscription route
app.use("/api/v1/subscription", subscriptionRouter);

// Play List Route
app.use("/api/v1/playlist", playlistRouter);

// CommentRouter Route
app.use("/api/v1/comment", CommentRouter);

// likeRouter Route
app.use("/api/v1/like", likeRouter);

// dashboardRouter route
app.use("/api/v1/dashboard", dashboardRouter);


app.get("/", (req, res) => {
    res.send("Welcome to VideoTube API")
    
});

export {app}