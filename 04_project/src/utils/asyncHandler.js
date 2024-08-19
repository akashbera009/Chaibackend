// doing async database calling as higher order function

        // 1. using promise 
const asyncHandler = (requestHandler) =>{
    (req , res , next )=>{
         Promise
         .resolve(
            requestHandler(req, res, next)
         )
         .catch((err)=> 
            next(err)
        )
    }
}

export default {asyncHandler}



    // 2. OR using try catch  

// const asyncHandler=(fn)=> async (req,res, next)=>{     
//  try{
//     await fn(req, res ,next)
//  }catch(err){
//     res.status(err.code || 500 ).json({    // just for frontened use , pass error code 
//         success:false,
//         message:err.message
//     })
//  }       
// }
