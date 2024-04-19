import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app= express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit:"16kb"}))//Limits the json FILE storage
app.use(express.urlencoded({extended:true,limit:"16kb"}))//Limits the URL ENCODED data storage
app.use(express.static("public"))//
app.use(cookieParser())

//ROUTES
import  userRoutes from './routes/user.routes.js';

app.use("/api/v1/users",userRoutes)

//http://localhost:5000/api/v1/users/register

export{app}