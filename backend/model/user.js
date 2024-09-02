const { DataTypes } = require("sequelize");
const connection = require('../config/db');
const User = connection.define('user', {
    users_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    role:{
        type:DataTypes.TINYINT,
        allowNull:false
    }
});

module.exports = User;
