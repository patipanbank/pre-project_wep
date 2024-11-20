const { DataTypes } = require('sequelize');
const {connection} = require('../config/db');

const Datas = connection.define('Data', {
  data_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    // Remove autoIncrement to allow manual setting of data_id
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
  },
  status: {
    type: DataTypes.ENUM('in_office', 'out_office', 'Leave'),
    allowNull: false,
    defaultValue: 'out_office',
  } ,
  last_checkin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  c_date: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  c_time: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'data',
  charset: 'utf8',
  collate: 'utf8_unicode_ci',
  timestamps: false
});

module.exports = Datas;
