import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import { Video } from "../models/videos.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const videoStats = await Video.aggregate([
    [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "liked",
        },
      },
      {
        $project: {
          totalLikes: {
            $size: "$liked",
          },
          totalViews: "$views",
          totalVideos: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: {
            $sum: "$totalLikes",
          },
          totalViews: {
            $sum: "$totalViews",
          },
          totalVideos: {
            $sum: 1,
          },
        },
      },
    ],
  ]);
  if (!videoStats) {
    throw new ApiErrors(
      404,
      "Error while getting Video stats in getChannelsStats"
    );
  }
  const subscribersStats = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        subscribersCount: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscribersCount: 1,
      },
    },
  ]);
  if (!subscribersStats) {
    throw new ApiErrors(
      404,
      "Error while fetching Subscriber in getChannelStats"
    );
  }

  const allStats = {
    totalSubscribers: subscribersStats[0]?.subscribersCount || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
  };
  return res
    .status(200)
    .json(new ApiResponses(201, allStats, "All stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channelVideos = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "channel",
        foreignField: "owner",
        as: "channelVideos",
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
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $project: {
        channel: 1,
        channelVideos: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!channelVideos) {
    throw new ApiErrors(
      404,
      "Error while fetching Channels videos in getChannelVideos"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponses(
        201,
        channelVideos,
        "Fetched channel videos successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
