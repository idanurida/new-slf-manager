// server/src/models/SimakItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const SimakItem = sequelize.define('SimakItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Kode unik item simak (e.g., SIM.DINDING.01)'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kategori item simak (e.g., Dinding, Pintu dan Jendela, Atap)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Deskripsi item simak'
  },
  column_config: {
    type: DataTypes.JSONB || DataTypes.TEXT,
    allowNull: false,
    comment: 'Konfigurasi kolom dinamis untuk item simak'
  },
  applicable_for: {
    type: DataTypes.ARRAY(DataTypes.STRING) || DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Array jenis permohonan yang sesuai (baru, existing, perubahan_fungsi, perpanjangan_slf, pascabencana)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif item simak'
  }
}, {
  timestamps: true,
  tableName: 'simak_items',
  underscored: true
});

// Relasi dengan model lain
SimakItem.associate = (models) => {
  // Relasi dengan SimakResponse
  SimakItem.hasMany(models.SimakResponse, {
    foreignKey: 'simak_item_id',
    as: 'responses'
  });
};

module.exports = SimakItem;