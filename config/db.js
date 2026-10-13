const mongoose = require('mongoose');

const connectDB = async () =>{
    if(!process.env.MONGODB_URI){
        throw new Error("MongoDB URI is missing");
    }
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
}

module.exports = connectDB;