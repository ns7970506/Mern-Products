const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')

dotenv.config()
connectDB();


const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth',authRoutes)

const PORT = process.env.PORT || 5000
    app.listen (PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
        
    })