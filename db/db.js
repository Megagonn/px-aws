// const mysql = require('mysql');
const { Sequelize } = require('sequelize');
require("dotenv").config();

const dbConfig = new Sequelize(
    "b7qlj6rnktg72maa2ulf",//process.env.MYSQL_ADDON_DB,
    "uverpipif8mdpqtf",//process.env.MYSQL_ADDON_USER,
    "3s3cM3Fm6uBQKOM6bBtd",//process.env.MYSQL_ADDON_PASSWORD,
    {
        host: "b7qlj6rnktg72maa2ulf-mysql.services.clever-cloud.com",//process.env.MYSQL_ADDON_HOST,
        dialect: 'mysql',
    }
);

module.exports = { dbConfig };