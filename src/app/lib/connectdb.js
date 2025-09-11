import mongoose from 'mongoose';

// main().catch(err => console.log(err));

const connectDB = async () => {

    try {
        if (mongoose.connections[0].readyState) {
            // Use current db connection
            console.log('database already connected');
            return;
        }
        // Use new db connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database Connected');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;