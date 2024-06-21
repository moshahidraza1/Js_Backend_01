import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";


export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token){
            throw new ApiError(401, "Unauthorized Access")
        }
        // check if user has the correct access Token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // select the user if it has correct token and remove password and refreshToken field from response
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token")
    }
})