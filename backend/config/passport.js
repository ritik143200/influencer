const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Influencer = require("../models/influencer");

// Debug: Log environment variables
console.log('🔍 Google OAuth Environment Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

// Only register Google strategy if credentials are actually available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT || 5002}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Step 1: Check if email already exists in User collection
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            // Login with existing user role — do NOT change role
            return done(null, existingUser);
          }

          // Step 2: Check if email already exists in Influencer collection
          const existingInfluencer = await Influencer.findOne({ email });
          if (existingInfluencer) {
            // Login with existing influencer role — do NOT change role, do NOT create a new user
            return done(null, existingInfluencer);
          }

          // Step 3: Email not found anywhere — create a new User with default role = "user"
          const newUser = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            // Random password for Google users (they won't use it directly)
            password: 'google-auth-' + Math.random().toString(36).slice(-8),
            role: 'user'
          });

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.log("⚠️  Google OAuth credentials not found. Google login will be disabled.");
}

// Serialize and deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;