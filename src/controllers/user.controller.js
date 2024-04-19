import {asyncHandler} from '../utils/asyncHandler.js'


const regiterUser= asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok IS good",
    })
})
export {regiterUser}