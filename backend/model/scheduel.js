const Schedule = sequelize.define('Schedule', {
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
  }, {
    tableName: 'schedules',
    timestamps: false,
  });
  
  // Associations
  Schedule.belongsTo(Data, { foreignKey: 'data_id' });
  Schedule.belongsTo(Timeslot, { foreignKey: 'timeslots_id' });
  
  Data.hasMany(Schedule, { foreignKey: 'data_id' });
  Timeslot.hasMany(Schedule, { foreignKey: 'timeslots_id' });