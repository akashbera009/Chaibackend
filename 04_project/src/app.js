import express from "express"
import cookieParser from "cookie-parser"   // for request for coookies 
import cors from "cors"    

const app = express()


//.use() function of express 
app.use(cors({          // config setting / middleware   
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))


// received data setting 
/// json data 
app.use(express.json({limit:"16kb"}))    /// express with json  !!
// url data
app.use(express.urlencoded({extended:true,limit:"16kb"}))  // express with url    || extended::object nasting 
// ststic files like images and favicon
app.use(express.static("public"))   // for assts like favison, images etc || public name only  ,,, will be stored in temp folder
// CRUD operation in cookie ,,,, only server can do tha 
app.use(cookieParser())



// routes import 
import userRouter from './routes/User.routes.js'

// routes declaration 
app.use("/api/v1/users", userRouter)    // we could do app.get , but we would use middleware, so why app.use 

// here at /api/v1/user the userRouter method will be called the next router will be called and the mothod will be called accordingly , like '/register' route  or '/login'
// https://localhost:8000/users/register ( upto users same then register is auto added )

export {app}
