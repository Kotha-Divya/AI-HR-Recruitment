const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Trying to connect to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("Connection Error:");
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;