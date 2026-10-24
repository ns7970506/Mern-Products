const User = require('../models/user')
const OTP = require('../models/otp')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendOTPEmail} = require('../utils/sendEmail')

const generateOTP = ()=>{
   return Math.floor( 100000 + Math.random()*900000).toString()
}

const generateToken =(id, role)=>{
    return jwt.sign({id,role},process.env.JWT_SECRET ,{expiresIn:'7d'})
}

const register = async(req, res)=>{
    try{
        const {name , email, password, role} = req.body;
         const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        let user = await User.findOne({email: normalizedEmail})

        if(user)
            return res.status(400).json({ message :'User already exists'})

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        user = await User.create({
            name,
            email: normalizedEmail,
            password:hashedPassword,
            role: 'user' ,
            isVerified:false
        })

        const otp = generateOTP()
        await OTP.create({email,otp,action:'account_verification'})
        await sendOTPEmail(email, otp , 'account_verification')

        res.status(201).json({
            message : 'OTP Sent to your Email. Please Verify',
            email:user.email
        })
    }
    catch(error){
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists' })
        }
        res.status(500).json({message:'Server Error', error:error.message})
    }
    
}

const logIn = async (req,res)=>{
    try{
        const {email , password} = req.body;
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message: 'Invalid Credentials'})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message : 'Invalid Credentials'})
        }

        if(!user.isVerified && user.role !== 'admin'){
            const otp = generateOTP()
            await OTP.findOneAndDelete({ email: user.email, action:'account_verification'})
            await OTP.create({email: user.email , otp , action:'account_verification'})
            await sendOTPEmail(user.email, otp , 'action_verification')
            return res.status(403).json({message:'Account not Verified', needsVerification:true,email:user.email})
        }

        res.json({
            _id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
            token:generateToken(user.id,user.role)
        })
    }
    catch(error){
        res.status(500).json({message: 'Server Error', error:error.message})
        
    }
}


  const verifyOTP = async (req,res)=>{
    try{
        const {email , otp }= req.body;
        const validOTP = await OTP.findOne({email,otp,action:'account_verification'})

        if(!validOTP){
            return res.status(400).json({ message : 'Invalid or Expired OTP'})
        }

        const user = User.findOneAndUpdate({email},{isVerified:true},{new:true})
        await OTP.deleteOne({_id: validOTP._id}) // delete otp after usage

        res.json({
            _id: user.id,
            name: user.name,
            email:user.email,
            role:user.role,
            token: generateToken(user.id,user.role)
        })
    }
    catch(error){
        res.status(500).json({message:'Server Error'})
    }
  }
module.exports = {register, logIn, verifyOTP}
