const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const user = require('../model/user');

passport.use(new GoogleStrategy({
    clientID: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await user.findOne({ where: { googleId: profile.id } });
        if (!existingUser) {
            existingUser = await user.create({
                googleId: profile.id,
                name: profile.displayName,
                email:profile.emails[0].value
            });
        }
        return done(null, existingUser);
    } catch (err) {
        return done(err, null);
    }
}));
