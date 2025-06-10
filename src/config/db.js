require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: (msg) => {
        if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('executing')) {
            console.log(msg);
        }
    }
});

module.exports = sequelize;
