const express = require('express')
const router = express.Router()


const {register,logIn,verifyOTP} = require ('../controller/authController')

router.post('/register',register)
 router.post('/login',logIn)
 router.post('/verify-otp',verifyOTP)



module.exports =router;

