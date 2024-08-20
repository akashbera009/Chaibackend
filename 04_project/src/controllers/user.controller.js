import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser  = asyncHandler ( async (req, res )=>{
    // res.status(200).json({
    //     message: "runnig , everything is all right "
    // })

   
    /*[ //   steps ----
        1.   get user details from frontened
        2.   validation  -- not empty 
        3.   check user already exist (using email)
        4.   check the images files 
        5.  upload them to cloudinary , avatar 
        6.  create user object -- create entry in DB
        7.  remove password and refresh token from response 
        8.  check for user creation 
        9.  return res 
    ] */
            //  1.   get user details form frontened
    const {fullname , email , username,password}=req.body   // all data comes to req.body 
    console.log('email ',email,password);
    // fieles uploaded thorugh user.routes.js

          //      2.   validation  -- not empty 
    if (
        [fullname,email,username, password].some((filed)=> filed.trim()==="")   // could be done thorugh .map but final return was to be decided , so its easy 
    ) throw new ApiError(400, "All fields are requird")
       
          //   3.  check user already exist (using email)
    const existedUser= User.findOne({
        $or:[{ username },{ email }]    // or operator 
     })
     if (existedUser){
        throw new ApiError(409,  "Username or user email already exists")
     }

        //  4.   check the images files  
           console.log(req.files)  
    const avatarLocalPath  = req.files?.avatar[0]?.path     // multer uploaded file , and return the path 
    const coverimageLocalPath = req.files?.coverimage[0]?.path
    // first property (avatar[0]) returns parg uploaded by multer 
    // ? = optionally may be get 
     if (!avatarLocalPath) throw new ApiError(400, "Avtar file is requird")

     //     5.  upload to cloudinary , avatar 
    const avatar = await uploadOnCloudinary (avatarLocalPath)  // only after upload the next process will be done , that's why await is used
    const coverimage = await uploadOnCloudinary (coverimageLocalPath)
    if (!avatar){
        throw new ApiError(400, "Avtar file is requird")   // if avatar is not there in cloudnary 
    }

    //      6.  create user object -- create entry in DB 
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverimage: coverimage?.url || "",  // coverimage was not compulsary
        email,
        password,
        username:username.toLowerCase()
    }) 

    //      7.  remove password and refresh token from response 
    const createdUser= await User.findById(user._id).select(   // check if the user is created or not by the mongoDB by default _id property 
        "-password -refreshToken"       /// this fields are to be nulled , - means not requird 
    )

    //       8.  check for user creation 
    if (!createdUser) throw new ApiError(500, "Something went wrong while regestering the user ")

    //       9.  return res 
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully ")
    )
})

export {registerUser}