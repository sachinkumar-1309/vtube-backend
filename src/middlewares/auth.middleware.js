import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(
  async (
    req,
    /*res : res yhn pe use nhi ho rha tha toh uske jagah _ v likh skte h*/ _,
    next
  ) => {
    try {
      const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "")/* //yhn pe Header k andar "Authorization:Bearer <token>" yeh milta hai hmlo ko, but hmlog ko "Bearer " toh chahihye hi nhi esliye .replace ka use kr k "Bearer " ko "<empty string>" se replace kr diye*/
      // const tokenFromCookies = req.cookies?.["access token"];
      // const tokenFromHeader = req
      //   .header("Authorization")
      //   ?.replace("Bearer ", "");

      //   console.log("Token from cookies:", tokenFromCookies);
      //   console.log("Token from header:", tokenFromHeader);

      // const token = tokenFromCookies || tokenFromHeader;
      
      //   console.log("req: " + req.cookies);
      // //   console.log("accessToken cookie:", req.cookies.['access token']);
      //   console.log("Cookies:", Object.keys(req.cookies));

      if (!token) {
        throw new ApiErrors(401, "Unauthorized request");
      }


        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token: "+decodedToken)

      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiErrors(401, "Invalid Access token");
      }

      (req.user = user), //creates an object within the req.body
        next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      throw new ApiErrors(401, error?.message || "Invalid Access token");
    }
  }
);
