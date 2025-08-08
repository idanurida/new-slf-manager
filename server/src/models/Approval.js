// server/src/models/Approval.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reports',
      key: 'id'
    },
    comment: 'ID laporan yang disetujui'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memberikan approval'
  },
  role: {
    type: DataTypes.ENUM(
      'project_lead',
      'head_consultant',
      'klien'
    ),
    allowNull: false,
    comment: 'Role yang memberikan approval'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: 'Status approval'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar dari approver'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal approval'
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal penolakan'
  }
}, {
  timestamps: true,
  tableName: 'approvals',
  underscored: true
});

// Relasi dengan model lain
Approval.associate = (models) => {
  // Relasi dengan Report
  Approval.belongsTo(models.Report, {
    foreignKey: 'report_id',
    as: 'report'
  });
  
  // Relasi dengan User
  Approval.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'approver'
  });
};

module.exports = Approval;