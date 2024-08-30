Doing the connection of mongodb , and the file folder structure 


## use : is used for any configuration , method of express 
    {app.js}

        app.use(cors({          // config setting / middleware   
            origin:process.env.CORS_ORIGIN,
            Credential:true
        }))                                                          ===  config the CORS

        app.use(express.json({limit:"16kb"}))                       === config the json format 

        app.use(express.urlencoded({extended:true,limit:"16kb"}))  === extended::object nasting 

        app.use(express.static("public"))                          === for assts like favison, images etc

        app.use(cookieParser())                                    === for cookie 


# utils  
database calling is a common work that making this a util is a ease of work 
    {asyncHandler.js }  =>
    1. Using Promise 
    2. Try catch  { take the function (let say DB calling function)  as parameter and async that , also catch error }
    takes 4 input : err , req, res , next 

# api error 
Extenda the Node.js Error calss
    sends  parameter to  constructor : message, statusCode , errors 
# api response 
     sends  parameter to  constructor : message, statusCode , data 

# MiddleWare 


---- part 9
## mongoose Aggrigation pipeline
    import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

## bcrypt (for encrypt password )
       npm i bcrypt  
     #--  A library for hashing passwords and comparing hashed passwords to plaintext. 
     hashing / encryption :         
       userSchema.pre("save", async function(next){
            if (!this.isModified("password")) return next()          //  if password field is modified  then change else no  
            this.password  = bcrypt.hash(this.password, 10 ) // encryption
             next() 
         })
     Compare :
         userSchema.methods.isPasswordCorrect = async function (password) {
            bcrypt.compare(password, this.password)   // bcrypt has function itself  compare  ::: (the user password ,  encrypter password)  
        }
## jwt  (json web token) 
     npm i jsonwebtoken 
    #--   Authentication: When a user successfully logs in, the server creates a JWT and sends it back to the user.
   Structure of a JWT:
        A JWT is composed of three parts, separated by dots (.):

        Header
        Payload
        Signature

     jwt.sign() in this method : 
        Header: Automatically includes the algorithm (e.g., HS256) and the token type (JWT).
        Payload: Contains the user's _id, email, username, and fullname.
        Signature: Generated using the header, payload, and secret key.

## refresh tokens 
    In web applications, users often need to stay logged in for extended periods. However, keeping an access token valid for a long time can be risky if the token is compromised. To address this, access tokens typically have short expiration times (e.g., 15 minutes to an hour). When the access token expires, the user needs a way to obtain a new one without logging in again. This is where the refresh token comes in.

    When a user logs in, the server generates two tokens:
    a.An access token:
    b.A refresh token: 
        1.When the access token expires (based on the expiresIn time), the client can no longer use it to authenticate requests.
        2.Instead of asking the user to log in again, the client sends the refresh token to the server to request a new access token.

----part 10  file upload

# Multer 
as a middleware ::: meet me before going ..
    npm i multer
    #-- 1.Takes file from user and store it into the local server temperary ,,, 
        2. Using Cloudinary upload that file to the cloud 

        app.post('/profile', upload.single('avatar'), function (req, res, next) {    
            // req.file is the `avatar` file
            // req.body will hold the text fields, if there were any
        })
         
          '/profile' ::: route 
          upload.single('avatar')::: middleware
          function (req, res, next) ::: coutroller
    
# cloudnary 
as a utils
    npm i cloudinary 

    import { v2 as cloudinary } from 'cloudinary';

    const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if (!localFilePath) return null // if there is no file path 
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, 
           { resourc_type : "auto"}
        )
        //file has been uploaded successfully , now 
        console.log('file is uploaded on clouinary ', response.url);
        return response  ; 
    }catch(error){
        fs.unlinkSync(localFilePath)   /// remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
}l

## fs (file system management )

    read, write , remove the file 
    unlinked : if file is successfully uploaded , it can be unliked 


----part 11  controller and routes 

 ## postman application 
    asyncHandler->user.controller->User.route->+ app.js->index.js 

     here at /api/v1/user the userRouter method will be called the next router will be called and the mothod will be called accordingly , like '/register' route  or '/login'


----part 12  Logic Building 

      /*[ //   steps ----
        1.   get user details form frontened
        2.   validation  -- not empty 
        3.   check user already exist (using email)
        4.   check the images files 
        5.  upload to cloudinary , avatar 
        6.  create user object -- create entry in DB
        7.  remove password and refresh token from response 
        8.  check for user creation 
        9.  return res 
    ] */

    
router.route("/register").post(         // register 
    upload.fields([    // upload middleware
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


--- part 13 postman 
    POSTMAN
        POST request to localhost://5000/api/v1/users/register 
        Environment Variables ->...
    MongoDB 
        Database->AKASH BERA'S ORG -2024-08-16-> YOUTUBE ->
 file format from backend :
   req.body , 
   req.files coverimage[{filed:"edsx" ,path:..}]

  postman  