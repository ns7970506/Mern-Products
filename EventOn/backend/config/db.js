const mongoose = require('mongoose')

const connectDB = async ()=>{
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing from the backend environment');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected successfully (${conn.connection.name})`);
}

module.exports = connectDB;
