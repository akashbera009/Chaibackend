import mongoose from "mongoose"

const patientSchema = new mongoose.Schema({
  name:{
    type:String,
    reuired:true
  },
  diagnosedWith:{
    type:String,
    required:true
  },
  address:{
    type:Strig,
    required:true
  },
  number:{
    type:NUmber,
    required:true
  },
  bloodGroup:{
    type:String
  },
  gender:{
    type:String,
    enum:["MALE", "FEMALE", "OTHERS"],
    required:true
  },
  addmitedIn:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Hospital",
    required:true
  }
},{timestamps:true})

export const Patient =  mongoose.model("Patient", patientSchema)