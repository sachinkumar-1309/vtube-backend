import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "videoID not found");
  }
  const likedVideo = await Like.findOne({
    video: videoId,
    isLikedBy: req.user?._id,
  });
  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);

    return res
      .status(200)
      .json(
        new ApiResponses(
          201,
          { likedVideo: false },
          "Video UnLiked  successfully"
        )
      );
  }
  const likeVideo = await Like.create({
    video: videoId,
    isLikedBy: req.user?._id,
  });

  if (!likeVideo) {
    throw new ApiErrors(500, "Server error while liking the video");
  }

  return res
    .status(200)
    .json(new ApiResponses(200, likeVideo, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiErrors(400, "comment id required");
  }
  const alreadyLiked = await Like.findOne({
    comment: commentId,
    isLikedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponses(
          200,
          { isLiked: false },
          "Comment like removed successfully"
        )
      );
  }

  const likeComment = await Like.create({
    comment: commentId,
    isLikedBy: req.user?._id,
  });

  if (!likeComment) {
    throw new ApiErrors(500, "Server error while liking the comment");
  }

  return res
    .status(200)
    .json(new ApiResponses(200, likeComment, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiErrors(400, "Tweet id required");
  }
  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    isLikedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponses(
          200,
          { isLiked: false },
          "Tweet like removed successfully"
        )
      );
  }

  const likeTweet = await Like.create({
    tweet: tweetId,
    isLikedBy: req.user?._id,
  });

  if (!likeTweet) {
    throw new ApiErrors(500, "Server error while liking the Tweet");
  }

  return res
    .status(200)
    .json(new ApiResponses(200, likeTweet, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        isLikedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        _id: 0,
        video: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          owner: {
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    },
    {
      $group: {
        _id: "$isLikedBy",
        likedVideo: { $push: "$$ROOT" },
        totalLikedVideos: { $sum: 1 },
      },
    },

    {
      $project: {
        _id: 0,
        likedVideo: 1,
        totalLikedVideos: 1,
      },
    },
    {
      $unwind: "$likedVideo",
    },
  ]);
  if (!likedVideos) {
    throw new ApiErrors(404, "Error while fetching liked videos");
  }
  return res
    .status(200)
    .json(
      new ApiResponses(
        201,
        { likedVideos },
        "Successfully fetched liked videos"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
