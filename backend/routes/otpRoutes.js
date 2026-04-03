const express = require('express');
const router  = express.Router();
const twilio  = require('twilio');
const Otp     = require('../models/Otp');
const Influencer = require('../models/influencer');

// Initialize Twilio client once using correct .env variable names
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone, email } = req.body; // e.g. "+91XXXXXXXXXX"

  try {
    // Check if influencer already exists
    if (email || phone) {
      const existingInfluencer = await Influencer.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (existingInfluencer) {
        return res.status(400).json({ 
          success: false, 
          message: 'An influencer with this email or phone already exists.' 
        });
      }
    }

    // 6 digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTP (if any)       
    await Otp.deleteMany({ phone });

    // Save new OTP
    await Otp.create({ phone, otp });

    // Send WhatsApp message
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to:   `whatsapp:${phone}`,
      body: `Your verification OTP is: ${otp} It will expire in 1 minute.`
    });

    res.json({ success: true, message: 'OTP has been sent!' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please check your credentials.' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = await Otp.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({ success: false, message: 'The OTP is incorrect or has expired!' });
    }

    // OTP correct — delete and send welcome message
    await Otp.deleteMany({ phone });

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to:   `whatsapp:${phone}`,
      body: `🎉 Welcome! Your account has been verified.\nWelcome to our app!`
    });

    res.json({ success: true, message: 'Verification successful!' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ success: false, message: 'Error during verification.' });
  }
});

module.exports = router;