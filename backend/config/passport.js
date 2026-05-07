const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Influencer = require("../models/influencer");
const crypto = require("crypto");

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
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5002}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const avatar = profile.photos?.[0]?.value || null;
          const displayName = profile.displayName;

          // ── Fast path: already linked by googleId ──────────────────────────
          let existingUser = await User.findOne({ googleId });
          if (existingUser) return done(null, existingUser);

          let existingInfluencer = await Influencer.findOne({ googleId });
          if (existingInfluencer) return done(null, existingInfluencer);

          // ── Existing User by email — merge Google fields, NEVER touch password ──
          existingUser = await User.findOne({ email });
          if (existingUser) {
            // Use updateOne with $set so the pre-save hook (which hashes passwords)
            // is NOT triggered, and the existing hashed password is preserved as-is.
            const updates = {};
            if (!existingUser.googleId) updates.googleId = googleId;
            if (!existingUser.avatar && avatar) updates.avatar = avatar;

            if (Object.keys(updates).length > 0) {
              await User.updateOne({ _id: existingUser._id }, { $set: updates });
            }

            // Return fresh doc so session has latest fields
            const refreshed = await User.findById(existingUser._id);
            return done(null, refreshed);
          }

          // ── Existing Influencer by email — merge Google fields ─────────────
          existingInfluencer = await Influencer.findOne({ email });
          if (existingInfluencer) {
            const updates = {};
            if (!existingInfluencer.googleId) updates.googleId = googleId;
            if (!existingInfluencer.avatar && avatar) updates.avatar = avatar;

            if (Object.keys(updates).length > 0) {
              await Influencer.updateOne({ _id: existingInfluencer._id }, { $set: updates });
            }

            const refreshed = await Influencer.findById(existingInfluencer._id);
            return done(null, refreshed);
          }

          // ── Brand-new Google user — create account ─────────────────────────
          // Placeholder password: 48-char hex, hashed by the User pre-save hook.
          // The user never needs to know or use this password unless they explicitly
          // set one via "Forgot Password" flow later.
          const randomPassword = crypto.randomBytes(24).toString('hex');

          const newUser = await User.create({
            name: displayName,
            email,
            googleId,
            avatar,
            password: randomPassword,
            role: 'user',
          });

          return done(null, newUser);
        } catch (err) {
          console.error('Google OAuth error:', err);
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