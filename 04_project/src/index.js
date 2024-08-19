import dotenv from "dotenv"   // experimental syntax 
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:'./env'
})



connectDB()         // sending response
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is runnig at ${process.env.PORT}`);
    })
    app.on("error", (error)=>{    // error on app
        throw error
    })
}
)
.catch(
    (err)=>{
        console.log(`MOngoDB connection failed!!! ${err}`);
        
    }
)
