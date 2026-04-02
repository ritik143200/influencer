// utils/sendWhatsApp.js

const twilio = require("twilio");

const sendWhatsAppMessage = async (phone, name) => {
  try {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Sanitize phone number to ensure E.164 format
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    
    // If it's a 10-digit number, assume India (+91) as default
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const messageTo = `whatsapp:${formattedPhone}`;
    const messageBody = `Welcome to Indori Influencer ${name}! 🎉 Please complete your profile.`;

    console.log(`📡 Attempting to send WhatsApp to: ${messageTo}`);

    const response = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: messageTo,
    });

    console.log(`✅ WhatsApp sent! SID: ${response.sid}`);
  } catch (err) {
    console.error("❌ WhatsApp error:", err.message);
  }
};

module.exports = sendWhatsAppMessage;