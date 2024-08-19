import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=> {          // db is in another continent ,,, always async await 
    try{
       const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       console.log(`mongoDB connected !!! DB host :${connectionInstance.connection.host}`);   // at where it is connected 
    }catch(error){
        console.log(`MONGODB Connection error ${error}`);
        process.exit(1)
    }
}

export  default connectDB