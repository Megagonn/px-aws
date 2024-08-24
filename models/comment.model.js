const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Comment = dbConfig.define('comments', {
    
    "post_id": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "uid": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "comment": {
        type: DataTypes.TEXT,
        allowNull: true, defaultValue: "",
    },
    "username": {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    "image_URL": {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    "timestamp": {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = { Comment };