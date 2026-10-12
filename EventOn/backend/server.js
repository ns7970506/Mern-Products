const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000
    app.listen (PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
        
    })