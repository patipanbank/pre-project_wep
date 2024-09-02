const connection = require('../config/db');
const { DataTypes } = require('sequelize');
const Timeslot = connection.define('Timeslot', {
    timeslots_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    dayofweek: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
      allowNull: false,
    },
  }, {
    tableName: 'timeslots',
    timestamps: false,
  });
module.exports = Timeslot;