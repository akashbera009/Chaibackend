import mongoose, { MongooseError } from "mongoose"
import { Product } from "./product.model"

const orderItemSchema= new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },
  quantiy:{
    type:Number,
    required:true
  }
})

const orderSchema = new mongoose.Schema({
  orderPrice:{
    type:Number,
    required:true 
  },
  customer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  orderItems:{
    type:[orderItemSchema]
  },
  address:{
    type:String,
    required:true
  },
  status:{
    type:String,
    enum:[ "PENDING", "CANCELLED" ,"DELIVERED" ] ,  // only available option 
    default:"PENDING"
  }
},{timestamps:true})

export const Order =  mongoose.model("Order", orderSchema)