# DATA MODELING in MONGOOSE 

## open stackblitz.com 
    create new file of express.js 
    at file > models > todos > (file) [ user.modesl.js, todo.models.js , sub_todo.models.js] 

   ### in user.models.js  write 
    import mongoose from "mongoose" 

    const userSchema = new mongoose.Schema({.......})

    export const User = mongoose.model("User",userSchema) 
                    $(user:which model be  created , userSchema: basis of the model )


   ## Schema
   const userSchema = new mongoose.Schema(
  {
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
      },
      password:{
        type:String,
        required:[true,"password is required "]
      },
        subTodos:[
              {
                type:mongoose.Schema.Types.ObjectId,
                ref:"SubTodo"
              }
         ]  /// array of sub todos 
  }
 ,{timestamps:true}
)