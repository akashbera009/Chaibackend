// verify whether user exist or not 
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


// the problem is the user wont type password to verify him as a valid user , so why we take acccessToken to verify
export const verifyJWT = asyncHandler( async (req,res,next)=>{
// got access from the  [.cookie("accessToken",accessToken,options)] in user controller.js    
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",""); // header for android cookies 
        if(!token ){
            throw new ApiError(401,"Unauthorized request")
        }
        // check if the token is valid by JWT itself 
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
         
        const user = await User.findById(decodedToken._id)// call db and check acces token 
        .select("-password, -refreshToken") // no need that 
    
        if (!user ){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user = user ;  //add the user object in the req 
        next()   // for the task after the middleware have done 

    } catch (error) {
        throw new ApiError(401,"Invalid Access Token !")
    }   
}) ; 
