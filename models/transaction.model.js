const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Transaction = dbConfig.define('transactions', {
    "email": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "uid": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "title": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "subtitle": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "type": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "amount":{
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    "timestamp":{
        type: DataTypes.DATE,
        allowNull: false,
    },
});

module.exports = { Transaction };