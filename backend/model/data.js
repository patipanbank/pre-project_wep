const { DataTypes } = require('sequelize');
const connection = require('../config/db');
const Datas = connection.define('Data', {
  data_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true // Automatically generate unique id if needed
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tel: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  major: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  available: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'on'
  }
}, {
  tableName: 'data',
  charset: 'utf8',
  collate: 'utf8_unicode_ci',
  timestamps: false // Set this to true if you want to include createdAt and updatedAt fields
});

module.exports = Datas;