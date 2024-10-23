const { DataTypes } = require("sequelize")
const { dbConfig } = require("../db/db");

const Accounts = dbConfig.define('accounts', {
    "name": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "account_name": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "account_number": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "account_reference": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "account_email": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "currency_code": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "bank_code": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "bank_name": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "status": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    "reservation_reference": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },

});

module.exports = { Accounts };