const User = require('../model/user'); // Capitalize model names by convention
require('dotenv').config();

// Update User
const updateUser = async (req, res) => {
    try {
        const { email, name, number, password } = req.body;

        // Find the current user by email from the JWT (req.user.email)
        const currentUser = await User.findOne({ where: { email: req.user.email } });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If email is being changed, check if it's already taken
        if (email && email !== req.user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update fields if provided, else keep existing
        currentUser.email = email || currentUser.email;
        currentUser.name = name || currentUser.name;
        currentUser.number = number || currentUser.number;
        currentUser.password = password || currentUser.password;
        await currentUser.save();


        res.status(200).json({ message: 'User updated successfully', user: currentUser });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const currentUser = await User.findOne({ where: { email: req.user.email } });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await currentUser.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
};

// Get User
const getUser = async (req, res) => {
    try {
        const currentUser = await User.findOne({ where: { email: req.user.email } });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password: _, ...userData } = currentUser.get({ plain: true });
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving user', error: err.message });
    }
};

module.exports = { updateUser, deleteUser, getUser };
