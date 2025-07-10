import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../model/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import {deleteFromCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";

// Generate access and refresh token function
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(500, "user not found by userId");
    }
    const accessToken = user.generateAccessToken();

    if (!accessToken) {
      throw new ApiError(
        500,
        "can not find access Token from generate access token function"
      );
    }

    const refreshToken = user.generateRefreshToken();

    if (!refreshToken) {
      throw new ApiError(
        500,
        "can not find refresh Token from generate refresh token function"
      );
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// teste function
const testeApi = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test api is working",
  });
});

// User Register
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(req.files);
  const avatarLocalPath = path.resolve(req.files?.avatar[0]?.path);

  let coverImageLocalPath;
  if (
    req?.files &&
    Array.isArray(req?.files?.coverImage) &&
    req?.files?.coverImage.length > 0
  ) {
    // coverImageLocalPath = req.files.coverImage[0].path
    coverImageLocalPath = path.resolve(req?.files?.coverImage[0]?.path);
    // coverImageLocalPath = req?.files?.coverImage[0]?.path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Local path file is required");
  }
  //console.log("Avatar Local Path:", avatarLocalPath);
  //console.log("Cover Image Local Path:", coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("avatar is ", avatar)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //console.log("Cover Image Cloudinary Response:", coverImage);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // if (!coverImage || !coverImage.secure_url) {
  //      throw new Error("Cover image upload failed");
  // }

  const user = await User.create({
    fullName,
    avatar: {
      secure_url: avatar.secure_url,
      public_id: avatar.public_id,
    },

    coverImage: coverImage
      ? {
          secure_url: coverImage.secure_url,
          public_id: coverImage.public_id,
        }
      : {
          secure_url: "",
          public_id: "",
        },
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  //console.log("email is", email);

  if (!username && !email) {
    throw new ApiError(401, "username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user is loggedin successfully"
      )
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  //console.log("user is", req.user._id)

  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } }, //this remove the field from decument
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// Refresh Token for re login without giving password
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, email: email },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


// Update User Avatar 
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    console.log("avatar is :", avatarLocalPath)

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // 1. Get current user to access old avatar public_id
    const user = await User.findById(req.user?._id);

    // 2. Delete old avatar from Cloudinary if it exists
    if (user?.avatar?.public_id) {
        // You need to implement or import this utility
        await deleteFromCloudinary(user.avatar.public_id);
    }

    // 3. Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.secure_url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // 4. Update user with new avatar info
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: {
                    secure_url: avatar.secure_url,
                    public_id: avatar.public_id
                }
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Avatar image updated successfully")
        );
});


// Update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    // 1. Get current user to access old cover image public_id
    const user = await User.findById(req.user?._id);

    // 2. Delete old cover image from Cloudinary if it exists
    if (user?.coverImage?.public_id) {
        await deleteFromCloudinary(user.coverImage.public_id);
    }

    // 3. Upload new cover image
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.secure_url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    // 4. Update user with new cover image info
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: {
                    secure_url: coverImage.secure_url,
                    public_id: coverImage.public_id
                }
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Cover image updated successfully")
        );
});

// Get User Channel Profile 
const getUserChannelProfile = asyncHandler(async(req, res) => {
       const {username} = req.params
       
       if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
      const channel = await User.aggregate([
        {
          $match : {
            username : username?.toLowerCase()
          }
        },
        { 
          $lookup: { 
          from: "subscription", 
          localField: "_id", 
          foreignField: "channel", 
          as: "subscribers" 
        } 
      },
      {
        $lookup: {
          from: "subscription",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields: {
          subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
        }
      },
      {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
      ])

       if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

// Get User Watch History
const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )

})

export {
  registerUser,
  generateAccessAndRefereshTokens,
  testeApi,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
