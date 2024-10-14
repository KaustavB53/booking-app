//contains a set of api that lets the user create, update and view their own hotels
import express,{Request, Response, Router} from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import Hotel, { HotelType } from '../models/hotel';
import verifyToken from '../middleware/auth';
import {body} from 'express-validator';

const router = express.Router();

const storage = multer.memoryStorage();//we want to store any file/img in memory
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, //5MB
    }
})

//this is the endpoint the fe will make a request to whenever user submits the add hotel form
//multer: take the binary img fields from the form data in the request and gives us all that stuff as object we can handle easier
router.post(
    '/', 
    verifyToken,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('country').notEmpty().withMessage('Country is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('type').notEmpty().withMessage('Hotel type is required'),
        body('pricePerNight').notEmpty().isNumeric().withMessage('Price per night is required and must be a number'),
        body('facility').notEmpty().isArray().withMessage('Facilities are required')
    ],
    upload.array("imageFiles", 6), 
    async(req: Request, res: Response)=>{
    try{
        const imageFiles = req.files as Express.Multer.File[];
        const newHotel: HotelType = req.body;
        //1. upload images to cloudinary
        const imageUrls = await uploadImages(imageFiles);//wait for all imgs to be uploaded before we get a string[] that get assigned to imageUrls
        //2. if upload was successful, add urls to the new hotel
        newHotel.imageUrls = imageUrls;
        newHotel.lastUpdated = new Date();
        newHotel.userId = req.userId;

        //3. save new hotel to db
        const hotel = new Hotel(newHotel);
        await hotel.save();

        //4. return 201 status
        res.status(201).send(hotel);

        

    }catch(e){
        console.log('error creating hotel', e);
        res.status(500).json({message: 'Something went wrong'});
    }
});

router.get('/', verifyToken, async(req: Request, res: Response)=>{
    try{
        const hotels = await Hotel.find({userId: req.userId});
    res.json(hotels);
    }catch(error){
        res.status(500).json({message: 'Error fetching hotels'})
    }
});

router.get('/:id', verifyToken, async(req: Request, res: Response)=>{
    const id = req.params.id.toString();
    try{
        const hotel = await Hotel.findOne({
            _id: id,
            userId: req.userId,
        })
        res.json(hotel);
    }catch(error){
        res.status(500).json({message: 'Error fetching hotels'})
    }
});

router.put('/:hotelId', verifyToken, upload.array("imageFiles"), async(req: Request, res: Response)=>{
    try{
        const updatedHotel: HotelType = req.body;
        updatedHotel.lastUpdated = new Date();

        const hotel = await Hotel.findOneAndUpdate({
            _id: req.params.hotelId,
            userId: req.userId,
        }, updatedHotel, {new: true});

        if(!hotel){
            return res.status(404).json({message: 'Hotel not found'})
        }

        const files = req.files as Express.Multer.File[];
        const updatedImageUrls = await uploadImages(files);

        hotel.imageUrls = [...updatedImageUrls, ...(updatedHotel.imageUrls || [])];
        await hotel.save();
        
    }catch(error){
        res.status(500).json({message: 'Something went wrong'})
    }
})



async function uploadImages(imageFiles: Express.Multer.File[]) {
    const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString('base64'); // converting img into b64 string
        let dataURI = "data:" + image.mimetype + ";base64," + b64;
        const res = await cloudinary.v2.uploader.upload(dataURI);
        return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises); //wait for all imgs to be uploaded before we get a string[] that get assigned to imageUrls
    return imageUrls;
}


export default router;