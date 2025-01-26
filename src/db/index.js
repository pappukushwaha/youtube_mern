import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MOGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connection success !! DB HOST : ${connectionInstance.connection.host}`);    
    } catch (error) {
        console.log('MongoDB connection error: ', error);
        console.log('Exiting process...');
        process.exit(1);
    }
}

export default connectDB;