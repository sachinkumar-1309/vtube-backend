import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
    try {
        const connentionInstances=await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connentionInstances.connection.host}`)
    } catch (error) {
        console.log("MongoDB connention FAILED: "+ error)
        // throw error; 
        process.exit(1);//node ka use kr k exit kiye h...
    }
}

export default connectDB;