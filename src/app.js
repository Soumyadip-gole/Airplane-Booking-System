const express = require('express');
const app = express();

const passport = require('passport');
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//swagger
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const helmet = require('helmet')
const cors = require('cors')
const xss = require('./middleware/xss')
const ratelimit = require('express-rate-limit')

app.set('trust proxy', 1);
app.use(express.json());
app.use(helmet());
app.use(cors())
app.use(xss);
app.use(ratelimit({
    windowMs: 900000,
    max:100
}));


const flightRoutes = require('./route/flight');
const authRoutes = require('./route/auth');
const userRoutes = require('./route/user');
const bookingRoutes = require('./route/booking');
const authMiddleware = require('./middleware/authentication');
require('./services/googleauth');

app.use('/api/flights', flightRoutes);
app.use('/auth', authRoutes);
app.use('/user',authMiddleware, userRoutes);
app.use('/booking',authMiddleware, bookingRoutes);


//connecting db and starting server
const sequelize = require('./config/db');
const user = require('./model/user');
const booking = require('./model/booking');
const port = process.env.PORT || 3000;
const start = async () => {
    try{
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('Database Connected!');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }catch(error) {
        console.error('Error starting the application:', error);
    }
}
start()