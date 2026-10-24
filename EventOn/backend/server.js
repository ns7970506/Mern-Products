const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/event')

dotenv.config()


const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth',authRoutes)
app.use('/api/events',eventRoutes)

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Server startup failed: ${error.message}`);
        process.exitCode = 1;
    }
};

startServer();
