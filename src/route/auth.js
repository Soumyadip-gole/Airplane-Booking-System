const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authcontroller = require('../controller/auth');

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        const user = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        };
        const token = jwt.sign({id:user.id,email:user.email,name:user.name}, process.env.AUTH_SECRET, { expiresIn: '4h' });

        res.json({ token:token, name: user.name, email: user.email });
    }
);

router.post('/login',authcontroller.login)

router.post('/register',authcontroller.register)

module.exports= router;

