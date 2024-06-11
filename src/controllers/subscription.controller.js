import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/users.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiErrors(404, "Channel ID is not valid");
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  // console.log(isSubscribed);
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed._id);

    return res
      .status(200)
      .json(
        new ApiResponses(
          201,
          { isSubscribed: false },
          "Unsubscribed successfully"
        )
      );
  } else {
    // console.log("IsSubscribed: " + isSubscribed);
    const subscribing = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    if (!subscribing) {
      throw new ApiErrors(500, "Error while subscribing");
    }
    return res
      .status(200)
      .json(
        new ApiResponses(201, { isSubscribed: true }, "Subscribed successfully")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiErrors(
      404,
      "Invalid channel id fetched while getUserChannelSubscribers"
    );
  }
  const subscribersList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberList",
      },
    },
    {
      $addFields: {
        subscribersDetails: {
          $first: "$subscriberList",
        },
      },
    },
    {
      $group: {
        _id: null,

        totalSubscriber: {
          $sum: 1,
        },
        userName: {
          $push: "$subscribersDetails.username",
        },
        avatar: {
          $push: "$subscribersDetails.avatar",
        },
      },
    },
    {
      $project: {
        totalSubscriber: 1,
        userName: 1,
        avatar: 1,
        channel: 1,
      },
    },
  ]);
  {
    console.log("subscriber: " + subscribersList);
  }
  if (!subscribersList.length === 0) {
    throw new ApiErrors(404, "No subscribers");
  }
  return res
  .status(200)
  .json(
    new ApiResponses(
      201,
      subscribersList,
      "Subscriber count fetched successfully"
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiErrors(
      404,
      "Invalid subscriber id fetched while getSubscribedChannels"
    );
  }

  const channelSubscribedList = await Subscription.aggregate([
    {
      $match: {
        subscriber:new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField:"channel",
        foreignField: "_id",
        as: "channelSubscribedList"
      }
    },
  {
    $addFields: {
      channelsSubscribedDetails:{
        $first:"$channelSubscribedList"
      }
    }
  },
  {
    $group: {
      _id: null,
      totalChannelSubscribded:{
      $sum:1
      },
      userName:{
        $push:"$channelsSubscribedDetails.username"
      },
      avatar:{
        $push:"$channelsSubscribedDetails.avatar"
      }
    }
  },
  {
    $project: {
      userName:1,
      avatar:1,
      totalChannelSubscribded:1,
      
    }
  }
  ])

  if(!channelSubscribedList){
    throw new ApiErrors(404, "No Channel subscribed");
  }
  return res
  .status(200)
  .json(
    new ApiResponses(
      201,
      channelSubscribedList,
      "Channel subscribed count fetched successfully"
    )
  );
  
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
