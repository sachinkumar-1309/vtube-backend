import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/users.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiErrors(500, "Content is required");
  }

  const createdTweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!createdTweet) {
    throw new ApiErrors(404, "Tweet not created");
  }
  return res
    .status(200)
    .json(new ApiResponses(200, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiErrors(404, "User ID not found");
  }
  const tweets = await Tweet.find({ owner: userId }).exec();
  console.log("Tweets: " + JSON.stringify(tweets));

  if (!tweets) {
    throw new ApiErrors(500, "Tweets not found");
  }
  if (tweets.length === 0) {
    throw new ApiErrors(404, "Tweet has no data");
  }
  return res
    .status(200)
    .json(
      new ApiResponses(
        200,
        { tweets },
        "User tweets fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId) {
    throw new ApiErrors(404, "Tweet ID not provided for update");
  }
  if (!content) {
    throw new ApiErrors(404, "Tweet data not provided for update");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content: content },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponses(201, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiErrors(500, "Tweet ID not found");
  }
  
  await Tweet.findByIdAndDelete(tweetId);
  return res
    .status(200)
    .json( 
      new ApiResponses(200, `Deleted successfully`)
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
