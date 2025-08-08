// server/src/utils/validators.js
const Joi = require('joi');
const { validateEmail, validatePhone } = require('./helpers');

/**
 * Validator untuk registrasi user
 */
const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.min': 'Password minimal 8 karakter',
      'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
      'any.required': 'Password wajib diisi'
    }),
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama minimal 3 karakter',
      'string.max': 'Nama maksimal 255 karakter',
      'any.required': 'Nama wajib diisi'
    }),
  role: Joi.string()
    .valid(
      'superadmin',
      'head_consultant',
      'project_lead',
      'admin_lead',
      'inspektor',
      'drafter',
      'klien'
    )
    .required()
    .messages({
      'any.only': 'Role tidak valid',
      'any.required': 'Role wajib diisi'
    }),
  phone: Joi.string()
    .pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Nomor telepon tidak valid'
    }),
  company: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Nama perusahaan maksimal 255 karakter'
    })
});

/**
 * Validator untuk login user
 */
const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password wajib diisi'
    })
});

/**
 * Validator untuk pembuatan proyek
 */
const projectCreationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama proyek minimal 3 karakter',
      'string.max': 'Nama proyek maksimal 255 karakter',
      'any.required': 'Nama proyek wajib diisi'
    }),
  owner_name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama pemilik minimal 3 karakter',
      'string.max': 'Nama pemilik maksimal 255 karakter',
      'any.required': 'Nama pemilik wajib diisi'
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'Alamat wajib diisi'
    }),
  building_function: Joi.string()
    .valid(
      'rumah_tinggal',
      'gedung_kantor',
      'mall_perbelanjaan',
      'rumah_sakit',
      'sekolah',
      'hotel',
      'apartemen',
      'industri',
      'gudang',
      'terminal',
      'bandara',
      'pelabuhan',
      'tempat_ibadah',
      'tempat_rekreasi',
      'fasilitas_umum'
    )
    .required()
    .messages({
      'any.only': 'Fungsi bangunan tidak valid',
      'any.required': 'Fungsi bangunan wajib diisi'
    }),
  floors: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.integer': 'Jumlah lantai harus bilangan bulat',
      'number.min': 'Jumlah lantai minimal 1',
      'number.max': 'Jumlah lantai maksimal 100',
      'any.required': 'Jumlah lantai wajib diisi'
    }),
  height: Joi.number()
    .precision(2)
    .min(1)
    .max(500)
    .optional()
    .messages({
      'number.precision': 'Tinggi bangunan maksimal 2 angka desimal',
      'number.min': 'Tinggi bangunan minimal 1 meter',
      'number.max': 'Tinggi bangunan maksimal 500 meter'
    }),
  area: Joi.number()
    .precision(2)
    .min(1)
    .max(1000000)
    .optional()
    .messages({
      'number.precision': 'Luas bangunan maksimal 2 angka desimal',
      'number.min': 'Luas bangunan minimal 1 m²',
      'number.max': 'Luas bangunan maksimal 1.000.000 m²'
    }),
  location: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Lokasi maksimal 500 karakter'
    }),
  coordinates: Joi.string()
    .pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Koordinat tidak valid (format: latitude,longitude)'
    }),
  request_type: Joi.string()
    .valid(
      'baru',
      'perpanjangan_slf',
      'perubahan_fungsi',
      'pascabencana'
    )
    .required()
    .messages({
      'any.only': 'Jenis permohonan tidak valid',
      'any.required': 'Jenis permohonan wajib diisi'
    }),
  project_lead_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID project lead harus bilangan bulat'
    }),
  client_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID klien harus bilangan bulat'
    })
});

/**
 * Validator untuk jadwal inspeksi
 */
const inspectionScheduleSchema = Joi.object({
  scheduled_date: Joi.date()
    .iso()
    .greater('now')
    .required()
    .messages({
      'date.iso': 'Tanggal harus dalam format ISO',
      'date.greater': 'Tanggal jadwal harus di masa depan',
      'any.required': 'Tanggal jadwal wajib diisi'
    }),
  inspector_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID inspektor harus bilangan bulat',
      'any.required': 'ID inspektor wajib diisi'
    }),
  drafter_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID drafter harus bilangan bulat'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Catatan maksimal 1000 karakter'
    })
});

/**
 * Validator untuk checklist response
 */
const checklistResponseSchema = Joi.object({
  checklist_item_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID checklist item harus bilangan bulat',
      'any.required': 'ID checklist item wajib diisi'
    }),
  sample_number: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Nomor sampel maksimal 50 karakter'
    }),
  response_ Joi.object()
    .pattern(Joi.string(), Joi.any())
    .optional()
    .messages({
      'object.pattern': 'Format respons tidak valid'
    })
});

/**
 * Validator untuk pembayaran
 */
const paymentSchema = Joi.object({
  amount: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      'number.precision': 'Jumlah pembayaran maksimal 2 angka desimal',
      'number.positive': 'Jumlah pembayaran harus positif',
      'any.required': 'Jumlah pembayaran wajib diisi'
    }),
  payment_date: Joi.date()
    .iso()
    .less('now')
    .required()
    .messages({
      'date.iso': 'Tanggal pembayaran harus dalam format ISO',
      'date.less': 'Tanggal pembayaran tidak boleh di masa depan',
      'any.required': 'Tanggal pembayaran wajib diisi'
    }),
  due_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal jatuh tempo harus dalam format ISO'
    }),
  proof_file_path: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Path file bukti pembayaran maksimal 500 karakter'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Catatan maksimal 1000 karakter'
    })
});

/**
 * Validator untuk verifikasi pembayaran
 */
const paymentVerificationSchema = Joi.object({
  status: Joi.string()
    .valid('verified', 'rejected')
    .required()
    .messages({
      'any.only': 'Status verifikasi tidak valid',
      'any.required': 'Status verifikasi wajib diisi'
    }),
  rejection_reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Alasan penolakan maksimal 500 karakter'
    })
});

/**
 * Validator untuk dokumen
 */
const documentSchema = Joi.object({
  type: Joi.string()
    .valid(
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
    )
    .required()
    .messages({
      'any.only': 'Jenis dokumen tidak valid',
      'any.required': 'Jenis dokumen wajib diisi'
    }),
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Judul dokumen minimal 3 karakter',
      'string.max': 'Judul dokumen maksimal 255 karakter',
      'any.required': 'Judul dokumen wajib diisi'
    }),
  file_path: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.max': 'Path file dokumen maksimal 500 karakter',
      'any.required': 'Path file dokumen wajib diisi'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Deskripsi dokumen maksimal 1000 karakter'
    }),
  uploaded_by: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID pengunggah harus bilangan bulat',
      'any.required': 'ID pengunggah wajib diisi'
    }),
  verified: Joi.boolean()
    .optional(),
  verified_by: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID verifier harus bilangan bulat'
    })
});

/**
 * Validator untuk approval
 */
const approvalSchema = Joi.object({
  report_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID laporan harus bilangan bulat',
      'any.required': 'ID laporan wajib diisi'
    }),
  user_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID user harus bilangan bulat',
      'any.required': 'ID user wajib diisi'
    }),
  role: Joi.string()
    .valid(
      'project_lead',
      'head_consultant',
      'klien'
    )
    .required()
    .messages({
      'any.only': 'Role approval tidak valid',
      'any.required': 'Role approval wajib diisi'
    }),
  status: Joi.string()
    .valid('pending', 'approved', 'rejected')
    .default('pending')
    .messages({
      'any.only': 'Status approval tidak valid'
    }),
  comment: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Komentar maksimal 1000 karakter'
    }),
  approved_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal approval harus dalam format ISO'
    }),
  rejected_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal penolakan harus dalam format ISO'
    })
});

/**
 * Validator untuk notifikasi
 */
const notificationSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID user harus bilangan bulat',
      'any.required': 'ID user wajib diisi'
    }),
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Judul notifikasi minimal 3 karakter',
      'string.max': 'Judul notifikasi maksimal 255 karakter',
      'any.required': 'Judul notifikasi wajib diisi'
    }),
  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Pesan notifikasi minimal 10 karakter',
      'string.max': 'Pesan notifikasi maksimal 1000 karakter',
      'any.required': 'Pesan notifikasi wajib diisi'
    }),
  is_read: Joi.boolean()
    .default(false),
  related_project_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID proyek terkait harus bilangan bulat'
    }),
  related_type: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Tipe terkait maksimal 50 karakter'
    }),
  related_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID terkait harus bilangan bulat'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Prioritas tidak valid'
    }),
  action_required: Joi.boolean()
    .default(false),
  action_url: Joi.string()
    .uri()
    .max(500)
    .optional()
    .messages({
      'string.uri': 'URL aksi tidak valid',
      'string.max': 'URL aksi maksimal 500 karakter'
    })
});

/**
 * Validator untuk laporan
 */
const reportSchema = Joi.object({
  project_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID proyek harus bilangan bulat',
      'any.required': 'ID proyek wajib diisi'
    }),
  inspection_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID inspeksi harus bilangan bulat'
    }),
  title: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'Judul laporan minimal 5 karakter',
      'string.max': 'Judul laporan maksimal 255 karakter',
      'any.required': 'Judul laporan wajib diisi'
    }),
  file_path: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Path file laporan maksimal 500 karakter'
    }),
  file_type: Joi.string()
    .valid('pdf', 'docx')
    .default('pdf')
    .messages({
      'any.only': 'Tipe file tidak valid'
    }),
  status: Joi.string()
    .valid(
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
    )
    .default('draft')
    .messages({
      'any.only': 'Status laporan tidak valid'
    }),
  generated_by: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID generator harus bilangan bulat'
    }),
  reviewed_by: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID reviewer harus bilangan bulat'
    }),
  reviewed_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal review harus dalam format ISO'
    }),
  sent_to_client_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal kirim ke klien harus dalam format ISO'
    }),
  submitted_to_gov_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal kirim ke pemerintah harus dalam format ISO'
    }),
  client_approved_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal approval klien harus dalam format ISO'
    }),
  client_rejected_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.iso': 'Tanggal penolakan klien harus dalam format ISO'
    }),
  client_approval_comment: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Komentar approval klien maksimal 1000 karakter'
    })
});

/**
 * Validator untuk simak response
 */
const simakResponseSchema = Joi.object({
  inspection_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID inspeksi harus bilangan bulat',
      'any.required': 'ID inspeksi wajib diisi'
    }),
  simak_item_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'ID item simak harus bilangan bulat',
      'any.required': 'ID item simak wajib diisi'
    }),
  sample_number: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Nomor sampel maksimal 50 karakter'
    }),
  location_detail: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Detail lokasi maksimal 255 karakter'
    }),
  year_built: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.integer': 'Tahun dibangun harus bilangan bulat',
      'number.min': 'Tahun dibangun minimal 1900',
      'number.max': `Tahun dibangun maksimal ${new Date().getFullYear()}`
    }),
  size: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Ukuran maksimal 100 karakter'
    }),
  material: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Material maksimal 100 karakter'
    }),
  damage_level: Joi.string()
    .valid('tidak_ada', 'kecil', 'sedang', 'besar')
    .optional()
    .messages({
      'any.only': 'Tingkat kerusakan tidak valid'
    }),
  specific_damage: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Kerusakan spesifik maksimal 500 karakter'
    }),
  overall_condition: Joi.string()
    .valid('kurang', 'sedang', 'baik', 'sangat_baik')
    .optional()
    .messages({
      'any.only': 'Kondisi keseluruhan tidak valid'
    }),
  estimated_useful_life: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.integer': 'Estimasi sisa umur harus bilangan bulat',
      'number.min': 'Estimasi sisa umur minimal 0 tahun',
      'number.max': 'Estimasi sisa umur maksimal 100 tahun'
    }),
  conclusion: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Kesimpulan maksimal 1000 karakter'
    })
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  projectCreationSchema,
  inspectionScheduleSchema,
  checklistResponseSchema,
  paymentSchema,
  paymentVerificationSchema,
  documentSchema,
  approvalSchema,
  notificationSchema,
  reportSchema,
  simakResponseSchema
};