const connection = require('../config/db');
const { DataTypes } = require('sequelize');
const Data = require('./data')
const Timeslot = require('./timeslot')
const Schedule = connection.define('Schedule', {
    schedules_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('Available', 'Unavailable', 'Waiting', 'Leave', 'Empty'),
      allowNull: false,
      defaultValue: 'Empty',
    }
  }, {
    tableName: 'schedules', 
    timestamps: false,
  });
  
  // Associations
  Schedule.belongsTo(Data, { foreignKey: 'data_id' });
  Schedule.belongsTo(Timeslot, { foreignKey: 'timeslots_id' });
  
Data.hasMany(Schedule, { foreignKey: 'data_id' });
Timeslot.hasMany(Schedule, { foreignKey: 'timeslots_id' });

module.exports = Schedule;