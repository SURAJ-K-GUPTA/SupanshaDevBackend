const mongoose = require('mongoose');

const connectDB = async () => {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
            });
            console.log('Connected to MongoDB');
            return;
        } catch (error) {
            retries++;
            console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
            
            if (retries === maxRetries) {
                console.error('Max retries reached. Could not connect to MongoDB');
                process.exit(1);
            }
            
            console.log(`Retrying in ${retryDelay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectDB();
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

module.exports = connectDB;