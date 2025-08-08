// server/src/models/ChecklistResponse.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ChecklistResponse = sequelize.define('ChecklistResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inspections',
      key: 'id'
    },
    comment: 'ID inspeksi terkait'
  },
  checklist_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'checklist_items',
      key: 'id'
    },
    comment: 'ID item checklist yang direspons'
  },
  sample_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nomor sampel untuk item ini (jika ada)'
  },
  response_ {
    type: DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Data respons dinamis dari inspektor berdasarkan column_config item'
  }
}, {
  timestamps: true,
  tableName: 'checklist_responses',
  underscored: true
});

module.exports = ChecklistResponse;