const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
const password = process.env.DB_PASSWORD || '';
const connection = new Sequelize("project_web","root",password,{
    host: 'localhost',
    dialect: 'mysql'
});


module.exports = connection;