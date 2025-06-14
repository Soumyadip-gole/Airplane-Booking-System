require('dotenv').config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    if(!req.headers.authorization||!req.headers.authorization.startsWith('Bearer ')){
        return res.status(401).send({ message: 'Authorization header is missing or invalid'})
    }
    const token = req.headers.authorization.split(' ')[1]
    try{
        req.user=jwt.verify(token,process.env.AUTH_SECRET)
    }catch (error) {
        return res.status(401).send({ message: 'Unauthorized', error: error });
    }
    next()
}
module.exports = auth