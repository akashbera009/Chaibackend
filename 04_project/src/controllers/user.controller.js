import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import { application } from "express";


const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user= await User.findById(userId); 

        const accessToken = user.generateAccessToken();  
        const refreshToken= user.generateRefreshToken();
      
    
        user.refreshToken = refreshToken;   // adding value of the refresh token in the user object and ..

        await user.save({validateBeforeSave:false})   //  saving to Database ||save is a MongoDB method 
        /*** whenever we want save the refresh token , there must be the password , but here password is not passed 
        that's why we remove the validation by using validateBeforeSave */
        return {accessToken, refreshToken}
    }
    catch(err){
        console.error('Error in generateAccessAndRefreshTokens:', err); // Log the actual error
        throw new ApiError(500 ,"Somethiing went Wrong While generating refresh token ")
    }
}




//              Register User
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
const registerUser  = asyncHandler ( async (req, res )=>{
  
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
    const avatarLocalPath = req.files?.avatar[0]?.path     // multer uploaded file , and return the path 
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

    // 1. ask Input form req.body
    const {email,username,password} = req.body 
    console.log(email);
    

     // 2.Check if input is right ,[ username || email] 
    if(!username && !email){
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
    console.log(refreshToken,accessToken);
    
    //  6.Give to user through cookies  
    const loggedInUser = await User.findById(user._id).   // sending the user object to the frontend 
    select({ password: 0, refreshToken: 0 })

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

// the problem is the user wont type password to verify him as a valid user , so why we take acccessToken to verify
const logOutUser = asyncHandler(async(req,res)=>{
    //clear cookies 
  await User.findByIdAndUpdate(          // FIND AND UPDATE REFRESH TOKEN // delete referesh token 
        req.user._id,
        {
            $set:{refreshToken: undefined}     // MONGODB OPERATOR 
        },
        {
            new: true// return  respone will be updated with new value 
        }
    )
    const options= {
        httpOnly:true,
        secure:true
    }
    return res      // clear cookie 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200 , {}, "User Logges Out ."))
})


//                      refreshtoken verification and sending to user 
// add refersh token end point      
const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorised requiest")
    }
   try {
     const decodedToken= jwt.verify(incomingRefreshToken, porcess.env.REFRESH_TOKEN_SECRET)  // verify by the JWT 
     const user = await User.findById(decodedToken?._id)  // fin d the user by it's _id which was encoded in Generate AccessToken method 
     if(!user){
         throw new ApiError(401, "Invalid refresh Token ")
     }
     //  match incomingAccess Token with Existing Access Token   
     if(incomingRefreshToken !== user.refreshToken){
         throw new Error(401 ,"refresh token is used or expired  ");   
     }
     // if matches generate new 
     const options=  {
         httpOnly:true,
         secure: true
     }
    const {accessToken, newRefreshToken}= await generateAccessAndRefreshTokens(user._id , options)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken, options)
     .json(
         new ApiResponse(
             200,
             {accessToken, newRefreshToken},
             "Access Token refreshed Successfully "
         )
     )
   } catch (error) {
        throw new ApiError(401,error.message  || "Invalid Refreesh token ");    
   }
})


//                      chnage  user password
    // find user by req.user.id
    // check if old password is true or not (throw error )
    // set new password 
    // save validatebeforesave : false  
    // return res, send success message 
const channgeCurrentPassword = asyncHandler(async(req,res)=>{

    /* dont know */const{oldPassword, newPassword} =req.body // getting oldpassword and newpassword from re.body HTTP requst body form user 
    const user = await User.findById(req.user?._id);
    const isOldPasswordtrue = await isPasswordCorrect(oldPassword)
     
    if (!isOldPasswordtrue){
        throw new ApiError(400, "Old passowrd is not true")
    }
    user.password= newPassword  // set password 
    await user.save({validateBeforeSave:false })    // not to validate

    return res
    .status(200)
    .json(new ApiResponse(200, {},"Password Changed Successfully "))

})

//          get current user 
const getCurrentUser = asyncHandler(async(req, res)=>{
    const currentuser = req.user 
    return res
    .status(200)
    .json(new ApiResponse(200 ,currentuser,"Current User fetched Successfully "))
})

//          update Account details (text based data )
// getting fullname ,email 
// check  for fullname  and email from user 
// Hold in user variable user =  findByidAndUpdate (findby.id, {what to update } , {new :true (return info after update )}) new info 
// remove the password field 
// return user 
const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullname , password } = req.body   // HTTP request bpdy from form submission 
    if (!fullname || !email){
        throw new ApiError(400, "Fullname of Email is Required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,  // find the user 
        {                           // update details by the mongoDB operator 
            $set:{
                fullname:fullname,
                email:email
            }
        },
        {new:true } // after update return the info 
    ).select("-password") // remove the password field 

    return res
    .status(200)
    .json(new ApiResponse(200, user , "Account Details Updated Successfuly "))
    
})


//      update Avatar files 
// use multer to update file 
        // 1. take file local path   req.file?.path
        // 2. check if the path exist or not 
        // 3. upload on cloudinary 
        // 4. check uploded url 
// update on the DB 
        // find by id and update avatar url ,{set}, {new :true }
        //. select("-password")
        // $set (avatar url )
const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarlocalPath = req.file?.path    //take file local path HTTP form submission 
    if (!avatarlocalPath) {         //check if the path exist or not  
        throw new ApiError(400 , "Avatar file is missing ");
    }
    const avatar = await uploadOnCloudinary(avatarlocalPath) //upload on cloudinary [return Object ]
    if (!avatar.url){                                    // check uploded url 
        throw new ApiError(400,"error while uploading an avatar ");
    }
    
   const user =  await User.findByIdAndUpdate(       //  find by id and update avatar url 
        req.user?._id ,
        {
            $set:{
                 avatar: avatar.url   // newAvatar is a Object ,but we olny update avatar url 
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user,"Avatar Local path Updated ") )
})

// update User Cover Image 
// * same 
const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath  = req.file?.path    //take file local path  form HTTP form submission 
    if (!coverImageLocalPath) {         //check if the path exist or not  
        throw new ApiError(400 , "Cover Image file is missing ");
    }
    const  coverimage = await uploadOnCloudinary(coverImageLocalPath) //upload on cloudinary [return Object ]
    if (!coverimage.url){                                    // check uploded url 
        throw new ApiError(400,"error while uploading an Cover Image ");
    }
    
    const user = await User.findByIdAndUpdate(       //  find by id and update avatar url 
        req.user?._id ,
        {
            $set:{
                 coverimage: coverimage.url   // newAvatar is a Object ,but we olny update avatar url 
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user,"Cover image Local path Updated ") )
})


// user channel and subscription , aggrigation pipeline 
const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} =req.params   // ..yt/channel/chhaiaurcode
    if(!username?.trim()){
        throw new ApiError(400 , "Username is missing ");
    }
    const channel = await User.aggregate([      // returns array 
        {           // first pipeline
            $match:{        // matches all the related document 
                username : username?.toLowerCase()
            }
        },
        {           // next pipeline 
            $lookup:{       // how much subscribers he have in his channel 
                from: "Subscription",
                localField:"_id",
                foreignField:"channel",   // to find total subscribers count in how many document he is as a channel
                as: "subscribers"
            }
        },
        {       // next pipeline 
            $lookup:{  //how many channels he have subscribed 
                from: "Subscription",
                localField:"_id",
                foreignField:"subscriber",// to find channels he subscribed , count in how many document he is as a subscriber 
                as: "subscribedTo"
            }
        },
        {       // next pipeline 
            $addFields:{            // added new field based on previous 
                subscriberCount: {
                    $size:$subscribers
                },
                channelsSubscribedToCount:{
                    $size:$subscribedTo
                },
                isSubscribed :{   // isSubscribed True/False 
                    $cond:{
                        if:{$in : [req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{  // returns only requested fields  only
                fullName:1,
                username:1,
                subscriberCount :1 ,
                channelsSubscribedToCount: 1,
                isSubscribed:1,
                avatar:1,
                email:1,
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404," cHannel doesn't exist");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0], "user channel fetched successfully ")
    )
})


// watch history  Sub-Pipeline 
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectID(req.user._id)
            }
        },
        {
            $lookup:{       //watchhistory / videos 
                from:"videos",
                localField:"watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[          // pipeline 
                    {
                        $lookup: {  // watchHistory / videos / owner    [sub-pipeline ]
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",     
                            as:"owner",
                            pipeline:[          // sub pipeline 
                                {       
                                    $project :{    // only for selecting the user fields  // [subPipeline]
                                        // this can be done in next pipeline instead of doing another   sub-pipeline 
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {    // sub pipeline
                        $addFields:{    // as the array is returned , we need only the first value 
                            owner: {    // overwrite from the previous pipeline 
                                $first: "$owner"   // 'first' get the first document in a sorted group of documents.
                            }
                        }
                    }
                ]
            }
        },
        
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200 , user[0].watchHistory,"Watch history fetched Successfully ") // only watchhistory is needed 
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    channgeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}