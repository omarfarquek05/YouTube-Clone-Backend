import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import dotenv from "dotenv";
dotenv.config();
//auth middleware for verifing jwt token
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {

        //token for web and header for mobile app 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        // Decode the token and verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // here user user._id comes from User model Access Token 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        
        //add user to req.user
        req.user = user;
        next();   

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})



{/*
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})
    */}