const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Notification = dbConfig.define('notifications', {
    "email": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "phone": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "user_id": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "details": {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = { Notification };