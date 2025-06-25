import { Router } from "express";
import { channgeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(         // register 
    upload.fields([    // upload *** middleware   just before the register user , upload images
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser
)  

//.... for the login route    // login 
router.route("/login").post(
    
    loginUser) 

// secure routes 
router.route("/logout").post(verifyJWT,logOutUser)  // middleware and then logout 

router.route("/refresh-token").post(refreshAccessToken)  // refresh token 

router.route("/change-password").post(verifyJWT,channgeCurrentPassword)  // change password 

router.route("/current-user").get(verifyJWT,getCurrentUser)     // current user 

router.route("/update-details").patch(verifyJWT,updateAccountDetails )  // update  user 

//update 
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)  // update avatar // single file 

router.route("/cover").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)  // update coverimage

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)  // channel 

router.route("/history").get(verifyJWT, getWatchHistory); // get history

export default router