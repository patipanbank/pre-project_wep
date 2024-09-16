const connection = require('../config/db');
const { DataTypes } = require('sequelize');

const Semester = connection.define('Semester', {
  semester_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true, // Allow NULL if required
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true, // Allow NULL if required
  },
  term: {
    type: DataTypes.ENUM('1', '2', '3'),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null, // Or DataTypes.NOW if auto-update is required
  },
}, {
  tableName: 'semester',
  timestamps: false, // Set to true if Sequelize should manage createdAt and updatedAt
});

module.exports = Semester;
