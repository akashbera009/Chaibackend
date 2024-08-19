import express from "express"
import cookieParser from "cookie-parser"   // for request for coookies 
import cors from "cors"    

const app = express()


//.use() function of expeess 
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


export {app}
