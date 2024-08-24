const { DataTypes } = require('sequelize');
const { dbConfig } = require('../db/db');

const Post = dbConfig.define('posts', {
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
    "uid": {
        type: DataTypes.STRING,
        allowNull: false, defaultValue: "",
    },
    "has_file": {
        type: DataTypes.BOOLEAN,
        allowNull: false, defaultValue: false,
    },
    "content": {
        type: DataTypes.TEXT,
        allowNull: true, defaultValue: "",
    },
    "post_image_URL": {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
    },
    "username": {
        type: DataTypes.STRING,
        allowNull: false,
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
    "timestamp": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "likes": {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // "comments": {
    //     type: DataTypes.TEXT,
    //     allowNull: false,
    // },
    "shares": {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
});

module.exports = { Post };