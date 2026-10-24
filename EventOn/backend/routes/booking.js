const express = require('express')
const router = express.Router()
const { protect, admin} = require('../middleware/authMiddleware')

router.post('/send-otp',protect,sendBookingOTP)
router.post('/',protect,bookEvent)
router.put('/:id/confirm',protect,admin,confirmBooking)
router.get('/my',protect,getMyBooking)
router.delete('/:id',protect,cancelBooking)

module.exports = router