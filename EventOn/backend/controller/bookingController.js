const Booking = require('../models/Booking')
const Event = require('../models/Event')
const OTP = require('../models/otp')
const {sendBookingEmail,sendOTPEmail} = require('../utils/sendEmail')

const generateOTP = ()=>{
    Math.floor(100000 + Math.random()*900000).toString()
}

const sendBookingOTP = async(req , res)=>{
    try{
        const otp = generateOTP()
        await OTP.findOneAndDelete({email:req.user.email, action:'event_booking'})
        await OTP.create({email:req.user.email,otp,action:'event_booking'})
        await sendOTPEmail(req.user.email,otp,'event_booking')
        res.json({ message:'OTP sent successfully'})
    }
    catch(error){
        res.status(500).json({message:'Error Sending OTP',error:error.message})
    }
}

const bookEvent = async(req,res)=>{
    try{
        const { eventId , otp} = req.body;
        const validOTP = await OTP.findOne({email:req.user.email, otp, action:'event_booking'})
        if(!validOTP){
            return res.status(400).json({message:'Invalid or Expired OTP'})
        }
        const event = await Event.findById(eventId) 
        if(!event) return res.status(404).json({message:'Event not found'})
        if(event.availableSeats<=0) return res.status(400).json({message:'No seat available'})

        const existingBooking = await  Booking.findOne({userId:req.userId,eventId})
        if(existingBooking && existingBooking.status!=cancelled){
            return res.status(400).json({message:'Already Booked or pending'})
        } 
        
        await Booking.create({
            userId:req.userId,
            eventId,
            status:'pending',
            paymentStatus:'not_paid',
            amount:event.ticketPrice
        })
            await OTP.deleteOne({_id:validOTP._id})
        res.status(201).json({message:'Booking request submitted',Booking})
    }
    catch(error){
        res.status(500).json({message:'Server error',error:error.message})
    }
}

const confirmBooking = async(req,res)=>{
    try{
        const { paymentStatus} = req.body
        const booking = await Booking.findById(req.params.Id).populate('userId').populate('eventId')
        if(!booking) return res.status(400).json({message:'Booking not found'})
         
        if(booking.status === 'confirmed')
            return res.status(400).json({message:'Bookng is Confirmed'})
        
          const event = await Event.findById(booking.eventId._id)
          if(event.availableSeats<=0){
            return res.status(400).json({message:'No Seat Available'})
          }

          booking.status = 'confirmed'
          if(paymentStatus){
            booking.paymentStatus = paymentStatus
          }

          await booking.save();

        event.availableSeats -= 1;
        await event.save();


        //  sending email on admin confirmation

        await sendBookingEmail(booking.userId.email,booking.userId.name,booking.eventId.title)

        res.status(200).json({message:'Booking Confirmed',booking})
    }
    catch(error){
        res.status(500).json({message:'Server error',error:error.message})
    }
}

const getMyBooking = async(req,res)=>{
    try{
        const booking = req.user.role === 'admin'
        ? await Booking.find().populate('eventId').populate('userId','name','email').toSorted({createdAt:-1})
        : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(booking)
    }
    catch(error){
        res.status(500).json({message:'Server error',error:error.message})
    }
}

const cancelBooking = async (req,res)=>{
    try{
        const booking = await Booking.findById(req.params.id)
        if(!booking) return res.status(404).json({message:'Booking Not found'})
        if(booking.userId.toString() !== req.userId && req.user.role !== admin){
            return res.status(403).json({message:'Not Authorised'})
        }
        if(booking.status === 'cancelled') return res.status(400).json({message : 'Already Cancelled'})
            
        const wasConfirmed = booking.status === 'confirmed'
        booking.status = 'cancelled'
        await Booking.save()
        
        if(wasConfirmed){
            const event = await Event.findById(booking.eventId)
            if(event){
                event.availableSeats+=1
                await Event.save()
            }
        }
        res.json({message:'Booking Cancelled successfully'})
    }
    catch(error){
        res.status(500).json({message:'Server Error', error:error.message})
    }
}

module.exports = {sendBookingOTP,bookEvent,confirmBooking,getMyBooking,cancelBooking}