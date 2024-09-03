const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Admin = dbConfig.define('admins', {
    "email": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "name": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "phone": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "imageURL": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "password": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "role": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "status": {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }

});

module.exports = { Admin };