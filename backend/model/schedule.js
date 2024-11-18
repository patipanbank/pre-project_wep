const {connection} = require('../config/db');
const { DataTypes, ENUM } = require('sequelize');
const Data = require('./data')
const Timeslot = require('./timeslot')
const Semester = require('./semester')


const Schedule = connection.define('Schedule', {
    schedules_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    } ,semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,  // Or true, depending on your requirements
  },

  }, {
    tableName: 'schedules', 
    timestamps: false,
  });
  

  // Associations
  Schedule.belongsTo(Data, { foreignKey: 'data_id' });
  Schedule.belongsTo(Timeslot, { foreignKey: 'timeslots_id' });
  Schedule.belongsTo(Semester, { foreignKey: 'semester_id' });
  
Data.hasMany(Schedule, { foreignKey: 'data_id' });
Timeslot.hasMany(Schedule, { foreignKey: 'timeslots_id' });
Semester.hasMany(Schedule, { foreignKey: 'semester_id' });

module.exports = Schedule;