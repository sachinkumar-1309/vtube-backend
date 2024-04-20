import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponses } from "../utils/ApiResponses.js";


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

  const { username, email, fullname, password ,refreshToken} = req.body;  

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

    // const existedUser=await User.findOne({// findOne does finds the first occurence of the matched entry
    //     $or: [{ username }, { email }],
    // });
    // console.log("existedUser: ", existedUser);
    // if (existedUser) {
    //     throw new ApiErrors(409,"User with this email or username already exists")
    // }

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    // console.log("Avatar Local Path:- "+avatarLocalPath)

    if(!avatarLocalPath){
      throw new ApiErrors(400, "Avatar image is required");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    // console.log("Avatar "+avatar+"\n")

    const user=await User.create({
      username:username.toLowerCase() ,
      email, 
      password,
      avatar:avatar?.url,
      coverImage:coverImage?.url || "",
      fullname,
    })

    const createdUser=await User.findById(user._id).select(["-password -refreshToken -watch"])
    /*
    checking if user is registered or not...
    ._id -->> mongoDB create by default an id 
    .select-->> by default it selects all the entities from which we had excluded password and refresh token by "-" operator 
    */

    if (!createdUser) {
      throw new ApiErrors(500,"Something went wrong while registering an User")//500 means SERVER ERROR
    }

    return res.status(201).json(
      new ApiResponses(200,createdUser,"User has been successfully Created!")
    );
    
});

export { regiterUser };
