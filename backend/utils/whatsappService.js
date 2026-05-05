const axios = require("axios");

/**
 * Sends a welcome message via AiSensy WhatsApp API
 * @param {string} phone - User's phone number with country code (e.g., +91...)
 * @param {string} name - User's name
 */
const sendWelcomeMessage = async (phone, name) => {
  try {
    if (!process.env.AISENSY_API_KEY) {
      console.warn("⚠️ AISENSY_API_KEY is not set in .env. Skipping WhatsApp message.");
      return null;
    }

    // Ensure phone number starts with + and country code
    let formattedPhone = phone;
    if (!phone.startsWith("+")) {
      // Default to +91 if no country code provided and it looks like an Indian number
      if (phone.length === 10) {
        formattedPhone = "+91" + phone;
      } else {
        formattedPhone = "+" + phone;
      }
    }

    const response = await axios.post(
      "https://backend.aisensy.com/campaign/t1/api/v2",
      {
        apiKey: process.env.AISENSY_API_KEY,
        campaignName: "brand_welcome", // ⚠️ Ensure this matches your AiSensy campaign name
        destination: formattedPhone,
        userName: name,
        source: "Website Signup",
        templateParams: [name]
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ AiSensy error:", error?.response?.data || error.message);
    // Do not block signup if message fails
    return null;
  }
};




// backend/utils/whatsappService.js

/**
 * Sends a welcome message to Influencers with their dashboard link
 * @param {string} phone - Influencer's phone number
 * @param {string} name - Influencer's name
 */
const sendInfluencerWelcomeMessage = async (phone, name) => {
  try {
    if (!process.env.AISENSY_API_KEY) return null;

    let formattedPhone = phone.startsWith("+") ? phone : (phone.length === 10 ? "+91" + phone : "+" + phone);

    const response = await axios.post(
      "https://backend.aisensy.com/campaign/t1/api/v2",
      {
        apiKey: process.env.AISENSY_API_KEY,
        campaignName: "influencer_welcome", // Create this campaign in AiSensy
        destination: formattedPhone,
        userName: name,
        source: "Influencer Registration",
        templateParams: [name]
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ AiSensy Influencer error:", error?.response?.data || error.message);
    return null;
  }
};

// Don't forget to export it
module.exports = { sendWelcomeMessage, sendInfluencerWelcomeMessage };


