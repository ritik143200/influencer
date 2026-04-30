/**
 * seedCities.js
 * Run once: node seedCities.js
 * Seeds the City collection with major Indian cities.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const City = require('./models/City');

const CITIES = [
  // A
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Ajmer', state: 'Rajasthan' },
  { name: 'Aligarh', state: 'Uttar Pradesh' },
  { name: 'Allahabad', state: 'Uttar Pradesh' },
  { name: 'Amravati', state: 'Maharashtra' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Aurangabad', state: 'Maharashtra' },
  // B
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Bareilly', state: 'Uttar Pradesh' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  // C
  { name: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Cuttack', state: 'Odisha' },
  // D
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Dhanbad', state: 'Jharkhand' },
  { name: 'Durgapur', state: 'West Bengal' },
  // E
  { name: 'Erode', state: 'Tamil Nadu' },
  // F
  { name: 'Faridabad', state: 'Haryana' },
  // G
  { name: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh' },
  { name: 'Gulbarga', state: 'Karnataka' },
  { name: 'Guntur', state: 'Andhra Pradesh' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Gwalior', state: 'Madhya Pradesh' },
  // H
  { name: 'Hubli', state: 'Karnataka' },
  { name: 'Hyderabad', state: 'Telangana' },
  // I
  { name: 'Indore', state: 'Madhya Pradesh' },
  // J
  { name: 'Jabalpur', state: 'Madhya Pradesh' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Jalandhar', state: 'Punjab' },
  { name: 'Jammu', state: 'Jammu & Kashmir' },
  { name: 'Jamnagar', state: 'Gujarat' },
  { name: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'Jodhpur', state: 'Rajasthan' },
  // K
  { name: 'Kalyan', state: 'Maharashtra' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Kolhapur', state: 'Maharashtra' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Kota', state: 'Rajasthan' },
  { name: 'Kozhikode', state: 'Kerala' },
  // L
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Ludhiana', state: 'Punjab' },
  // M
  { name: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Mangalore', state: 'Karnataka' },
  { name: 'Meerut', state: 'Uttar Pradesh' },
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Mysore', state: 'Karnataka' },
  // N
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Nashik', state: 'Maharashtra' },
  { name: 'Navi Mumbai', state: 'Maharashtra' },
  { name: 'Noida', state: 'Uttar Pradesh' },
  // P
  { name: 'Patna', state: 'Bihar' },
  { name: 'Pondicherry', state: 'Puducherry' },
  { name: 'Pune', state: 'Maharashtra' },
  // R
  { name: 'Raipur', state: 'Chhattisgarh' },
  { name: 'Rajkot', state: 'Gujarat' },
  { name: 'Ranchi', state: 'Jharkhand' },
  // S
  { name: 'Salem', state: 'Tamil Nadu' },
  { name: 'Sholapur', state: 'Maharashtra' },
  { name: 'Siliguri', state: 'West Bengal' },
  { name: 'Srinagar', state: 'Jammu & Kashmir' },
  { name: 'Surat', state: 'Gujarat' },
  // T
  { name: 'Thane', state: 'Maharashtra' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'Tirunelveli', state: 'Tamil Nadu' },
  // U
  { name: 'Udaipur', state: 'Rajasthan' },
  // V
  { name: 'Vadodara', state: 'Gujarat' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Vijayawada', state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  // W
  { name: 'Warangal', state: 'Telangana' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Upsert each city so re-running is safe
    let inserted = 0, skipped = 0;
    for (const city of CITIES) {
      const result = await City.updateOne(
        { name: { $regex: `^${city.name}$`, $options: 'i' } },
        { $setOnInsert: city },
        { upsert: true }
      );
      if (result.upsertedCount) inserted++;
      else skipped++;
    }

    console.log(`🏙️  Cities seeded: ${inserted} inserted, ${skipped} already existed`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
