import express, {Request, Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import userRoutes from './routes/users'
import authRoutes from './routes/auth'
import cookieParser from 'cookie-parser'
import path from "path";
import {v2 as cloudinary} from 'cloudinary';
import myHotelRoutes from './routes/my-hotels'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
// .then(()=>{console.log('Connected to Database: ', process.env.MONGODB_CONNECTION_STRING)}); cross check db connection


const app = express();
app.use(cookieParser())
app.use(express.json()) // converts the osy of api request into json automatically
app.use(express.urlencoded({extended: true})) // parse url
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.static(path.join(__dirname,"../../frontend/dist"))); // go to the fe dist folder, which has compiled fe static assets and serve those static assets on the root of be url

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/my-hotels', myHotelRoutes)

app.listen(3000, ()=>console.log("server's running on localhost: 3000"));