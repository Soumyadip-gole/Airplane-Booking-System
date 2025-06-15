const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authcontroller = require('../controller/auth');

router.get('/google', (req, res, next) => {
    // Capture the frontend_url from query parameters
    const frontendUrl = req.query.frontend_url || process.env.FRONTEND_URL || 'http://localhost:5174';
    
    // Store the frontend URL in the state parameter
    const state = Buffer.from(JSON.stringify({ frontendUrl })).toString('base64');
    
    // Pass the state to the Google OAuth flow
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        try {
            const user = {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            };
            
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                process.env.AUTH_SECRET,
                { expiresIn: '4h' }
            );

            // Extract frontend URL from state parameter
            let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            
            if (req.query.state) {
                try {
                    const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
                    if (stateData.frontendUrl) {
                        frontendUrl = stateData.frontendUrl;
                    }
                } catch (err) {
                    console.warn('Failed to parse state parameter, using default frontend URL:', err);
                }
            }

            const userDataEncoded = encodeURIComponent(JSON.stringify({
                name: user.name,
                email: user.email,
                id: user.id
            }));

            console.log('Redirecting to:', `${frontendUrl}/auth/google/callback?token=${token}&user=${userDataEncoded}`);
            res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${userDataEncoded}`);
        } catch (error) {
            console.error('Error in Google callback:', error);
            const fallbackUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            res.redirect(`${fallbackUrl}/auth?error=authentication_failed`);
        }
    }
);

router.post('/login', authcontroller.login);

router.post('/register', authcontroller.register);

module.exports = router;