// require('dotenv').config({path:'./env'}) ---> commented out because it breaks the consitentcy of the code as we are relying on the import  from 'dotenv' instead or require..

import dotenv from "dotenv";// This import feature is not fully implented, so to use this we need to run an experimental feature which we can do in package.json file in dev script as --> "-r dotenv/config --experimental-json-modules"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({ path: "./.env" });

connectDB()// Connect to MongoDB.
.then(()=>{
    app.listen(process.env.PORT||3000,()=>{
        console.log(`Server started at port ${process.env.PORT}`)
    })
})  
.catch((err)=>{
    console.log("Mongo db connection failed"+ err)
})

// function connectDB(){}

// connectDB();--->//This is also an approach to connect the database using mongoose but the problem is that "THE DATABASE IS ALWAYS IS IN ANOTHER CONTINENT" thus it takes time to load THEN we should use ASYNC AWAIT along with TRY CATCH statement .....

// HERE we will use ifis'()()' statement , which runs the statement imidiately...
/* ;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
        app.on("ERROR", (error) => {
        console.log(`Error : ${error}`);
        throw error;
        });
        app.listen(process.env.PORT,()=>{
            console.log(`App started running on ${process.env.PORT} port`)
        })
    } catch (error) {
        console.log("ERROR: " + error);
        throw error;
    }
})();
*/
