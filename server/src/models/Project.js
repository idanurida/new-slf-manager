// server/src/models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama proyek'
  },
  owner_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama pemilik bangunan'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Alamat lengkap proyek'
  },
  building_function: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Fungsi bangunan (rumah_tinggal, gedung_kantor, dll)'
  },
  floors: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Jumlah lantai bangunan'
  },
  height: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
    comment: 'Tinggi bangunan dalam meter'
  },
  area: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
    comment: 'Luas bangunan dalam meter persegi'
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi lokasi proyek'
  },
  coordinates: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Koordinat GPS (latitude, longitude)'
  },
  request_type: {
    type: DataTypes.ENUM(
      'baru',
      'perpanjangan_slf',
      'perubahan_fungsi',
      'pascabencana'
    ),
    allowNull: false,
    comment: 'Jenis permohonan SLF'
  },
  project_lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user dengan role project_lead yang menangani proyek'
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user dengan role klien yang memesan proyek'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'quotation_sent',
      'quotation_accepted',
      'contract_signed',
      'spk_issued',
      'spk_accepted',
      'inspection_scheduled',
      'inspection_in_progress',
      'inspection_done',
      'report_draft',
      'report_reviewed',
      'report_sent_to_client',
      'waiting_gov_response',
      'slf_issued',
      'completed',
      'cancelled'
    ),
    defaultValue: 'draft',
    comment: 'Status proyek saat ini'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang membuat proyek'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang terakhir mengupdate proyek'
  },
  approved_by_project_lead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Disetujui oleh Project Lead'
  },
  project_lead_approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal disetujui oleh Project Lead'
  },
  project_lead_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar dari Project Lead'
  },
  approved_by_head_consultant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Disetujui oleh Head Consultant'
  },
  head_consultant_approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal disetujui oleh Head Consultant'
  },
  head_consultant_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar dari Head Consultant'
  },
  approved_by_client: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Disetujui oleh Klien'
  },
  client_approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal disetujui oleh Klien'
  },
  client_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar dari Klien'
  },
  rejected_by_project_lead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Ditolak oleh Project Lead'
  },
  project_lead_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal ditolak oleh Project Lead'
  },
  rejected_by_head_consultant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Ditolak oleh Head Consultant'
  },
  head_consultant_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal ditolak oleh Head Consultant'
  },
  rejected_by_client: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Ditolak oleh Klien'
  },
  client_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal ditolak oleh Klien'
  },
  sent_to_client_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan dikirim ke klien'
  },
  submitted_to_gov_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan dikirim ke pemerintah'
  },
  slf_issued_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal SLF diterbitkan'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal proyek selesai'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal proyek dibatalkan'
  }
}, {
  timestamps: true,
  tableName: 'projects',
  underscored: true
});

module.exports = Project;