import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Ecommerce');
        console.log('MongoDB connected successfully');

    } catch(error){
        console.error('mongoDB conection error:', error);
        process.exit(1);
    }
};
export default connectDB;
