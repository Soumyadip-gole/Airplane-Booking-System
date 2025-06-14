const user = require('../model/user');
const jwt = require('jsonwebtoken');
const {hashPassword, verifyPassword}=require('../services/hash');

require('dotenv').config();

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required' });
    }
    try {
        const userData = await user.findOne({ where: { email:email } });
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!await verifyPassword(password, userData.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        let token = jwt.sign({ id:userData.id,email:userData.email,name:userData.name }, process.env.AUTH_SECRET, { expiresIn: '4h' })
        res.status(200).json({ token:token, name: userData.name, email: userData.email});
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const register = async (req, res) => {
    const { email, password,number,name } = req.body;
    if (!email || !password||!name) {
        return res.status(400).send({ message: 'Email, password and name are required' });
    }
    try{
        const userData = await user.findOne({ where: { email:email } });
        if (userData) {
            return res.status(404).json({ message: 'email already in use' });
        }
        const newUser = await user.create({ email, password:await hashPassword(password),number ,name});
        token=jwt.sign({ id:newUser.id,email:newUser.email,name:newUser.name }, process.env.AUTH_SECRET, { expiresIn: '4h' });
        res.json({ token:token, name: newUser.name, email: newUser.email });
    }catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {login, register};