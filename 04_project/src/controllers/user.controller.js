import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import { application } from "express";


const generateAccessAndRefreshTokens = async (userId) {
    try{
        const user= await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();

        user.refreshToken = refreshToken   // adding value of the refresh token in the user object and ..
        await user.save ({validateBeforeSave:false})   //  saving to Database ||save is a MongoDB method 
        /*** whenever we want save the refresh token , there must be the password , but here password is not passed 
        that's why we remove the validation by using validateBeforeSave */
        return {accessToken, refreshToken}
    }
    catch(err){
        throw new ApiError(500 ,"Somethiing went Wrong While generating While generatiing refresh token ")
    }
}

//              Register User
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
    console.log(req.body);
    
    console.log('email ',email,password);
    // fieles uploaded thorugh user.routes.js

          //      2.   validation  -- not empty 
    if (
        [fullname,email,username, password].some((filed)=> filed.trim()==="")   // could be done thorugh .map but final return was to be decided , so its easy 
    ) throw new ApiError(400, "All fields are requird")
       
          //   3.  check user already exist (using email)
    const existedUser= await  User.findOne({
        $or:[{ username },{ email }]    // MongoDB or operator 
     })
     if (existedUser){
        throw new ApiError(409,  "Username or user email already exists")
     }

        //  4.   check the images files  
           console.log(req.files)  
    const avatarLocalPath  = req.files?.avatar[0]?.path     // multer uploaded file , and return the path 
      if (!avatarLocalPath) throw new ApiError(400, "Avtar file is requird")
    // first property (avatar[0]) returns path uploaded by multer 
    // ? = optionally may be get 

    // const coverimageLocalPath = req.files?.coverimage[0]?.path 
    let coverimageLocalPath;
    if (req.body && Array.isArray(req.files.coverimage) && req.files.coverimage.lenght>0){
        coverimageLocalPath= req.files.coverimage[0].path // checking the cover image in classic JS
    }
   

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
        coverimage: coverimage?.url || "",  // coverimage was not compulsary  ,, fallback 
        email,
        password,
        username:username.toLowerCase()
    }) 

    //      7.  remove password and refresh token from response 
    const createdUser= await User.findById(user._id).select(   // check if the user is created or not by the mongoDB by default _id property 
        "-password -refreshToken"       /// this fields are to be nulled , - means not requird 
    )

    //       8.  check for user creation 
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user ")

    //       9.  return res 
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully ")
    )
})

//                  login user
const loginUser =  asyncHandler(async (req,res)=>{
    /*
        1.Take Input form req.body
        2.Check if input is right ,[ username || email] 
        3.Call DB for checking,, find user
        4.If user found , check password 
        5.Generate User refresh token & AcessToken 
        6.Give to user through cookies  
    */

    // 1. ake Input form req.body
    const {email,username,password} = req.body 

     // 2.Check if input is right ,[ username || email] 
    if(!(username || email)){
        throw new ApiError(400, "Email or Username is not given ")
    }

    // 3.Call DB for checking,, find user
    const user=await User.findOne({         /// instance of the user schema 
        $or: [{username,email}]  //or username or email
    })
    if(!user){
        throw new ApiError(404, "User Doesnot exist ")
    }
    // 4.If user found , check password 
    const isPasswordValid = await user.isPasswordCorrect(password)      // not with User : it is a object of MongoDB // user: our user created by usmongoose 
    if(!isPasswordValid){
        throw new ApiError(401, "Invalod  User Credintials ")
    }
    //  5.Generate User refresh token & AcessToken 
     /*  in the above we have created a method generateAccessAndReferenceTokens which will generate the refresh & Access token based on the userId */
     const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id);

    //  6.Give to user through cookies  
    const loggedInUser = await User.findById(user._id).   // sending the user object to the frontend 
    select("-password refreshToken")

    const options={   // cookies
        httpOnly :true, //these two properties do not allow to modify from the frontened ,but only from the Server  
        secure:true,// also this 
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)   // adding to cookie 
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        )
    )
})

//          log out 
const logOutUser = asyncHandler(async(req,res)=>{
    //clear cookies 
  await User.findByIdAndUpdate(          // FIND AND UPDATE REFRESH TOKEN // delete referesh token 
        req.User._id,
        {
            $set:{refreshToken: undefined}     // MONGODB OPERATOR 
        },
        {
            new: true
        }
    )
    const options= {
        httpOnly:true;
        secure:true
    }
    return res      // clear cookie 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200 , {}, "User Logges Out ."))
})
export {
    registerUser,
    loginUser,
    logOutUser
}