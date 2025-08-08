// server/src/models/Report.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Report = sequelize.define('Report', {
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
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inspections',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  file_type: {
    type: DataTypes.ENUM('pdf', 'docx'),
    allowNull: false,
    defaultValue: 'pdf'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'generated',
      'project_lead_review',
      'project_lead_approved',
      'head_consultant_review',
      'head_consultant_approved',
      'client_review',
      'client_approved',
      'client_rejected',
      'sent_to_government',
      'slf_issued',
      'completed',
      'cancelled'
    ),
    defaultValue: 'draft'
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_to_client_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submitted_to_gov_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  client_approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  client_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  client_approval_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  slf_issued_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'reports',
  underscored: true
});

module.exports = Report;