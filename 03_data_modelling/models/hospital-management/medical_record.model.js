import mongoose from "mongoose"

const medical_recordSchema = new mongoose.Schema({
  id:{
    type:String,
    required:true
  },
  patientName:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Patient",
    required:true
  },
  treatedBy:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Doctor",
    required:true
    }
  ],
  bill:{
    type:Number,
    required:true,
    default:0
  }
},{timestamps:true})

export const Medical_record =  mongoose.model("Medical_record", medical_recordSchema)