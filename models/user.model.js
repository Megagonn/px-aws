const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const User = dbConfig.define('users', {
    "first_name": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "last_name": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "email": {
        type: DataTypes.STRING,
        allowNull: false, unique: true, defaultValue: "",
    },
    "uid": {
        type: DataTypes.STRING,
        allowNull: false, unique: true, defaultValue: "",
    },
    "phone": {
        type: DataTypes.STRING,
        allowNull: false, unique: true,
        defaultValue: ""
    },
    "country_code": {
        type: DataTypes.STRING,
        allowNull: false, 
        defaultValue: "+234"
    },
    "username": {
        type: DataTypes.STRING,
        allowNull: false, unique: true,
        defaultValue: ""
    },
    "leader_board": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "image_URL": {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    "token": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "list": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "otp": {
        type: DataTypes.STRING,
        allowNull: true,
    },
    "wallet": {
        type: DataTypes.INTEGER,
        allowNull: false, defaultValue: 0
    },
    "budget": {
        type: DataTypes.INTEGER,
        allowNull: false, defaultValue: 0
    },
    "total_xpent": {
        type: DataTypes.INTEGER,
        allowNull: false, defaultValue: 0
    },
    "total_received": {
        type: DataTypes.INTEGER,
        allowNull: false, defaultValue: 0
    },
    "is_active": {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    "account_number": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    "password": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // "number_of_referral": {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     defaultValue: ""
    // },
});

module.exports = { User };