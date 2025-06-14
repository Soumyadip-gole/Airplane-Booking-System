const express = require('express');
const router = express.Router();
const {updateUser, deleteUser, getUser} = require('../controller/user');

router.patch('/update', updateUser);
router.delete('/delete', deleteUser);
router.get('/get', getUser);

module.exports= router;

