const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Withdrawal = dbConfig.define('withdrawals', {
    "email": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "uid": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "session_id": {
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

module.exports = { Withdrawal };