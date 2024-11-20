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


const { notifyWebSocketClients } = require('../service/ws.service');

Datas.addHook('afterCreate', async (instance, options) => {
  try {
    const freshData = await Datas.findByPk(instance.data_id, {
      raw: true
    });
    
    notifyWebSocketClients('create', {
      type: 'create',
      data: freshData
    });
  } catch (error) {
    console.error('Error in afterCreate hook:', error);
  }
});

Datas.addHook('afterUpdate', async (instance, options) => {
  try {
    const freshData = await Datas.findByPk(instance.data_id, {
      raw: true
    });
    
    notifyWebSocketClients('update', {
      type: 'update',
      data: freshData
    });
  } catch (error) {
    console.error('Error in afterUpdate hook:', error);
  }
});

Datas.addHook('afterDestroy', (instance, options) => {
  try {
    notifyWebSocketClients('delete', {
      type: 'delete',
      data: instance.toJSON()
    });
  } catch (error) {
    console.error('Error in afterDestroy hook:', error);
  }
});

Datas.addHook('afterBulkCreate', async (instances, options) => {
  try {
    const dataIds = instances.map(instance => instance.data_id);
    const freshData = await Datas.findAll({
      where: {
        data_id: dataIds
      },
      raw: true
    });
    
    notifyWebSocketClients('bulkCreate', {
      type: 'bulkCreate',
      data: freshData
    });
  } catch (error) {
    console.error('Error in afterBulkCreate hook:', error);
  }
});

Datas.addHook('afterBulkUpdate', async (options) => {
  try {
    if (options.where) {
      const updatedRecords = await Datas.findAll({
        where: options.where,
        raw: true
      });
      
      notifyWebSocketClients('bulkUpdate', {
        type: 'bulkUpdate',
        data: updatedRecords
      });
    }
  } catch (error) {
    console.error('Error in afterBulkUpdate hook:', error);
  }
});

Datas.addHook('afterBulkDestroy', (options) => {
  try {
    notifyWebSocketClients('bulkDelete', {
      type: 'bulkDelete',
      data: options.where
    });
  } catch (error) {
    console.error('Error in afterBulkDestroy hook:', error);
  }
});