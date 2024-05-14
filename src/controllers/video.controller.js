import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/users.models.js";
import { Video } from "../models/videos.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Convert page and limit to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  console.log("req.query: " + JSON.stringify(req.query));
  const queryObj = {};

  if (query) {
    queryObj.$text = { $search: query };
  }

  if (userId) {
    queryObj.userId = userId;
  }
  // --> EXPLANATION HERE <--

  let sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
    //sortOptions[sortBy] --> if sortBy has a value of "name", then sortOptions[sortBy] is equivalent to sortOptions["name"], which accesses or sets the property named "name" in the sortOptions object.
  } else {
    sortOptions.createdAt = -1;
  }
  console.log("Sort options ", sortOptions);

  try {
    const videos = await Video.find(queryObj)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("Videos: " + videos.length + JSON.stringify(videos));
    res.status(200).json(
      new ApiResponses(
        200,
        // data={videos,page,limit},
        videos,
        "Vidos fetched successfully"
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(new ApiResponses(500, "error occured while getting all videos"));
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video

  const { title, description, duration } = req.body;
  if (!(title && description)) {
    throw new ApiErrors(404, "Video not found (title and description)");
  }
  // console.log("Title: "+title)

  // const existedVideo=await Video.findOne({$or:[{title},{description}]})

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  // console.log("Video file: "+videoLocalPath)
  // console.log("Thumbnail file: "+thumbnailLocalPath)

  if (!videoLocalPath) {
    throw new ApiErrors(500, "Video not uploaded locally");
  }
  if (!thumbnailLocalPath) {
    throw new ApiErrors(500, "Thumbnail not uploaded locally");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // console.log("Video cloudinary path: "+videoFile)

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration,
    owner: req.user?._id,
  });
  // console.log("Single video: "+video)

  const videoUploaded = await Video.findOne(video._id);
  if (!videoUploaded) {
    throw new ApiErrors(500, "Error on saving the video");
  }
  return res
    .status(201)
    .json(new ApiResponses(200, videoUploaded, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiErrors(400, "Video ID not found");
  }
  let video = await Video.findById(videoId);
  if (!video) {
    throw new ApiErrors(404, "No video with this ID");
  }

  return res
    .status(200)
    .json(new ApiResponses(200, video, "Video retrieved Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiErrors(400, "Video ID not found");
  }

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiErrors(404, "Thumbnail not found");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new ApiResponses(400, "Error while uploading thumbnail file");
  }

  let video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiErrors(404, "No video with this ID");
  }
  return res
    .status(200)
    .json(new ApiResponses(200, video?.url, "Thumbnail updated sucessful"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiErrors(400, "Video ID not found while deleting video");
  }
  try {
    await Video.findByIdAndDelete(videoId);

    res.status(200).json(new ApiResponses(201, "Video deleted successfully"));
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ success: false, error: "Could not delete video" });
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
