const connection = require('../config/db');
const { DataTypes, ENUM } = require('sequelize');
const Data = require('./data')
const Timeslot = require('./timeslot')
const Semester = require('./semester')
const User = require('./user')

const Leave = connection.define('Leave', {
    leave_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('Available', 'Unavailable', 'Waiting', 'Leave', 'Empty','Approved','Reject'),
      allowNull: false,
      defaultValue: 'Empty',
    } ,semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,  // Or true, depending on your requirements
    },
    detail: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    feedback: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    users_id: {
      type: DataTypes.INTEGER,
    }
  }, {
    tableName: 'leave', 
    timestamps: false,
  });
  

  // Associations
  Leave.belongsTo(Data, { foreignKey: 'data_id' });
  Leave.belongsTo(Timeslot, { foreignKey: 'timeslots_id' });
  Leave.belongsTo(Semester, { foreignKey: 'semester_id' });


  
Data.hasMany(Leave, { foreignKey: 'data_id' });
Timeslot.hasMany(Leave, { foreignKey: 'timeslots_id' });
Semester.hasMany(Leave, { foreignKey: 'semester_id' });


module.exports = Leave;
