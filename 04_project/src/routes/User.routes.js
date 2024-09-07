import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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


export default router