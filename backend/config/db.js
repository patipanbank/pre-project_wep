const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
const connection = new Sequelize("project_web","root","root",{
    host: 'localhost',
    dialect: 'mysql'
});


module.exports = connection;