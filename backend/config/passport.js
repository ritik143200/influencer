const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

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
        // Check if credentials are configured
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          return done(new Error('Google OAuth credentials not configured'), null);
        }

        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // User exists, return user
            return done(null, user);
          } else {
            // Create new user with Google data
            const newUser = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              // Generate a random password for Google users
              password: 'google-auth-' + Math.random().toString(36).slice(-8),
              role: 'user'
            });
            
            return done(null, newUser);
          }
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