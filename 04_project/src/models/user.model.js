import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username :{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true,      // trim extra white sapces after and before 
        index: true
    } ,
    email :{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true
    } ,
   fullname:{
        type: String,
        required: true,
        trim:true,
        index:true
    } ,
    avatar :{
        type: String,    /// coludnary service 
        required: true,
    } ,
    coverimage:{
        type: String   // cloudnary 
    } ,
    watchHisotry:[
        { 
            type : Schema.Types.ObjectId,
            ref: "Video"
        }
        
    ],
    password:{
        type: String ,
        required: [true, "password is required"]
    },
    refreshToken:{
        type : String
    }

}, { timestamps: true}
)

// bcrypt hash and compare method 
userSchema.pre("save", async function(next){            // pre hook (just after saving), ::: save , update, validate 
    if (!this.isModified("password")) return next()         //  if password field is modified  then change else no  
    this.password  =await bcrypt.hash(this.password, 10 )                // encryption
    next()  
})    

userSchema.methods.isPasswordCorrect = async function (password) {       // custom method added  
   return await bcrypt.compare(password, this.password)     // bcrypt has function compare :::  (encrypted password,given password  ) 
    // returns true or false 
}

// jwt tokens generating 
userSchema.methods.generateAccessToken = function (){  
   return jwt.sign(
        {               // payload : coming from database 
          _id: this._id,     //does not have any special meaning 
          email:this.email,
          username:this.username,
          fullname: this.fullname     
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn :process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}   

userSchema.methods.generateRefreshToken = function  (){
    return jwt.sign(
        {                // payload : coming from database 
          _id: this._id,    // only id
          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn :process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}

export const User = mongoose.model("User", userSchema)