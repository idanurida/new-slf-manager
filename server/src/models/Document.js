// server/src/models/Document.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'SURAT_PERMOHONAN',
      'AS_BUILT_DRAWINGS',
      'KRK',
      'IMB_LAMA',
      'SLF_LAMA',
      'STATUS_TANAH',
      'FOTO_LOKASI',
      'QUOTATION',
      'CONTRACT',
      'SPK',
      'REPORT',
      'TEKNIS_STRUKTUR',
      'TEKNIS_ARSITEKTUR',
      'TEKNIS_UTILITAS',
      'TEKNIS_SANITASI'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'documents',
  underscored: true
});

module.exports = Document;