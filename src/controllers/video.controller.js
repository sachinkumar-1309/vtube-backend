import mongoose, {isValidObjectId} from "mongoose"
import {User} from '../models/users.models.js'
import { Video } from "../models/videos.models.js"
import {ApiErrors} from '../utils/ApiErrors.js'
import {ApiResponses} from '../utils/ApiResponses.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })
const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Convert page and limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    console.log("req.query: "+JSON.stringify(req.query))
    const queryObj = {};

    if (query) {
        queryObj.$text = { $search: query };
    }

    if (userId) {
        queryObj.userId = userId;
    }

    let sortOptions = {};
    if (sortBy && sortType) {
        sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;
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

            console.log("Videos: "+videos.length + JSON.stringify(videos));
        res
            .status(200)
            .json(
                new ApiResponses(
                        200,
                        // data={videos,page,limit},
                        videos,
                        "Vidos fetched successfully"
                )
            );
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}