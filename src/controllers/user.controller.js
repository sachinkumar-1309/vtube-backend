import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponses } from "../utils/ApiResponses.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    // console.log("generateAccessAndRefreshToken: " + user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false }); //user.save()--> yhn pe password field ya dusra requied field jo hoga whn pe wo v kick IN kr jyega jisse ki haar baar login krna pdega, esliye "validateBeforeSave:false" esliye yeh kiye hai... validition kuch mt lagao tm sidha ja k save kr do

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("\n Error: " + error);
    throw new ApiErrors(
      500,
      "Something went wrong while generating access or refresh token"
    );
  }
};

const regiterUser = asyncHandler(async (req, res) => {
  // STEPS ---->
  // get user details from frontend
  // vaildtion - not empty
  // check if user already exists : username , email
  // check upload images , check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token from the field resposne
  //check for user cretion
  //return res

  const { username, email, fullname, password } = req.body;

  // console.log("\nEmail:- " + email +" FullName:- "+fullname+" Refresh Token "+refreshToken+" Password "+password);

  // if(username ===''){
  //     return new ApiErrors(404 , "username is required");
  // }

  if (
    [username, email, fullname, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

  //Here we need to check whether email is of vaild syntax or not
  // if(email){
  //     check
  // }

  // User.findOne({username}),User.findOne({email}) ---> we can use this approach also but there is a better approach for this

  const existedUser = await User.findOne({
    // findOne does finds the first occurence of the matched entry
    $or: [{ username }, { email }],
  });
  console.log("existedUser: ", existedUser);
  if (existedUser) {
    throw new ApiErrors(409, "User with this email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; //TO : console req.files , req.files.avatar....
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // console.log("Avatar Local Path:- "+avatarLocalPath)

  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // console.log("Avatar "+avatar+"\n")

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    fullname,
  });

  const createdUser = await User.findById(user._id).select([
    "-password -refreshToken -watch",
  ]);
  /*
    checking if user is registered or not...
    ._id -->> mongoDB create by default an id 
    .select-->> by default it selects all the entities from which we had excluded password and refresh token by "-" operator 
    */

  if (!createdUser) {
    throw new ApiErrors(500, "Something went wrong while registering an User"); //500 means INTERNAL SERVER ERROR
  }

  return res
    .status(201)
    .json(
      new ApiResponses(200, createdUser, "User has been successfully Created!")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //req.body->data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const { email, password, username } = req.body;

  if (!(username || email)) {
    //if(!username || !email) yeh glt tha yhn pe -> LOGICAL error
    throw new ApiErrors(400, "Username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log("User: " + user);
  if (!user) {
    throw new ApiErrors(404, "Username or email does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  /*console.log(
     "IsPassword Correct: " + isPasswordValid + " UserID: " + user._id
  );*/

  if (!isPasswordValid) {
    throw new ApiErrors(401, "Invaild credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log("Access Token: " + accessToken);

  const loggedInUser = await User.findOne(user._id).select(
    "-password, -refreshToken"
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
      new ApiResponses(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponses(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiErrors(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiErrors(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiErrors(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponses(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid refresh token");
  }
});

export { regiterUser, loginUser, logoutUser, refreshAccessToken };
