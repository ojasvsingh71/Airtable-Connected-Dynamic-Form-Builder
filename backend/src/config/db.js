const mongoose = require('mongoose');


async function connectDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || undefined });
    console.log('MongoDB connected');
}


module.exports = connectDb;