const nodemailer = require("nodemailer");
const dotenv = require("dotenv");


dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed :${eventTitle}`,
      html: `
           <h2> Hi ${userName} </h2> 
           <p>  Your Booking for the Event <strong>${eventTitle}</strong> is successfully confirmed</p>
           <p>  Thank you for choosing EventOn</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error Sending failed", error);
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    const title =
      type === "account_verifications"
        ? "Verify your EnentOn Account"
        : "EventOn Booking Verifications";
    const msg =
      type === "account_verifications"
        ? "Please use the following OTP to verify your new Eventora account."
        : "Please use the following OTP to verify and confirm your event booking.";
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: title,
      html: `
                <div style='font-family:Arial,sans-serif; text-align:center; padding:20px;'>
                    <h2 style = 'color:#111'>${title}</h2>
                    <p style ='color:#555; font-size:16px'>${msg}</p>
                    <div style ='margin:20px auto; padding:15px, font-size:24px; font-weight:bold; background:#f4f4f4; width:max-content;letter-spacing:5px;'>${otp}</div>
                    <p style="color:#999; font-size:12px;">This Otp expires in 5 Minutes</p>
                </div>
                `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Otp", error);
  }
};

module.exports = { sendBookingEmail, sendOTPEmail };
