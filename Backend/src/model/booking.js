const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    flightNumber: { type: DataTypes.STRING, allowNull: false },
    airline: { type: DataTypes.STRING, allowNull: false },
    flightDate: { type: DataTypes.STRING, allowNull: false },
    depIata: { type: DataTypes.STRING, allowNull: false },
    arrIata: { type: DataTypes.STRING, allowNull: false },
    depTime: { type: DataTypes.STRING },
    arrTime: { type: DataTypes.STRING },
    tier: { type: DataTypes.STRING }, // e.g., Economy, Business
    status: { type: DataTypes.STRING, defaultValue: 'CONFIRMED' },
    bookingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    timestamps: true,
    tableName: 'bookings'
});

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

module.exports = Booking;
