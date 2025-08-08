// server/src/controllers/reportController.js
const Report = require('../models/Report');
const Project = require('../models/Project');
const Inspection = require('../models/Inspection');
const ChecklistResponse = require('../models/ChecklistResponse');
const ChecklistItem = require('../models/ChecklistItem');
const SimakResponse = require('../models/SimakResponse');
const SimakItem = require('../models/SimakItem');
const Photo = require('../models/Photo');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Get project reports
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjectReports = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Role-based access control
    if (req.user.role === 'klien' && project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    const reports = await Report.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reports);
  } catch (error) {
    console.error('Get project reports error:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
};

/**
 * Get report by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name', 'address']
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Role-based access control
    if (req.user.role === 'klien' && report.project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this report' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching report' });
  }
};

/**
 * Create new report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.createReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, inspection_id } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify inspection exists
    let inspection = null;
    if (inspection_id) {
      inspection = await Inspection.findByPk(inspection_id);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
    }

    // Only drafter and project_lead can create reports
    if (!['drafter', 'project_lead'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to create reports' });
    }

    // Create report
    const report = await Report.create({
      project_id: projectId,
      inspection_id: inspection_id || null,
      title: title || `Laporan SLF - ${project.name}`,
      file_path: null,
      file_type: 'pdf',
      status: 'draft',
      generated_by: req.user.id
    });

    // Send notification to project lead
    await Notification.create({
      user_id: project.project_lead_id,
      title: 'New Report Created',
      message: `New report "${report.title}" has been created for project "${project.name}"`,
      priority: 'medium',
      action_required: true,
      action_url: `/dashboard/project-lead/reports/${report.id}`
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error while creating report' });
  }
};

/**
 * Update report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, file_path, file_type, status } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only drafter and project_lead can update reports
    if (!['drafter', 'project_lead'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update reports' });
    }

    // Update report
    await report.update({
      title: title || report.title,
      file_path: file_path || report.file_path,
      file_type: file_type || report.file_type,
      status: status || report.status,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Server error while updating report' });
  }
};

/**
 * Delete report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only project_lead and head_consultant can delete reports
    if (!['project_lead', 'head_consultant'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete reports' });
    }

    // Delete report
    await report.destroy();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error while deleting report' });
  }
};

/**
 * Generate PDF report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.generatePDFReport = async (req, res) => {
  try {
    const { projectId, inspectionId } = req.params;
    const { title } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify inspection exists
    let inspection = null;
    if (inspectionId) {
      inspection = await Inspection.findByPk(inspectionId);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
    }

    // Only drafter can generate reports
    if (req.user.role !== 'drafter') {
      return res.status(403).json({ error: 'Not authorized to generate reports' });
    }

    // Get checklist responses
    const checklistResponses = await ChecklistResponse.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: ChecklistItem,
        as: 'checklistItem',
        attributes: ['id', 'code', 'category', 'description', 'column_config']
      }],
      order: [['created_at', 'ASC']]
    });

    // Get simak responses
    const simakResponses = await SimakResponse.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: SimakItem,
        as: 'simakItem',
        attributes: ['id', 'code', 'category', 'description']
      }],
      order: [['created_at', 'ASC']]
    });

    // Get photos
    const photos = await Photo.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'ASC']]
    });

    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '..', '..', 'uploads', 'reports');
    await fs.ensureDir(reportsDir);

    // Generate PDF filename
    const filename = `report-${project.id}-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe PDF to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Generate report content
    await generatePDFContent(doc, {
      project,
      inspection,
      checklistResponses,
      simakResponses,
      photos,
      generatedBy: req.user
    });

    // Finalize PDF
    doc.end();

    // Wait for PDF to be written
    writeStream.on('finish', async () => {
      // Update report with file path
      const report = await Report.create({
        project_id: projectId,
        inspection_id: inspectionId,
        title: title || `Laporan SLF - ${project.name}`,
        file_path: path.join('reports', filename),
        file_type: 'pdf',
        status: 'generated',
        generated_by: req.user.id
      });

      res.json({
        message: 'PDF report generated successfully',
        report: {
          id: report.id,
          title: report.title,
          file_path: `/uploads/${report.file_path}`,
          status: report.status
        }
      });
    });

    writeStream.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    });

  } catch (error) {
    console.error('Generate PDF report error:', error);
    res.status(500).json({ error: 'Server error while generating PDF report' });
  }
};

/**
 * Generate DOCX report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.generateDOCXReport = async (req, res) => {
  try {
    const { projectId, inspectionId } = req.params;
    const { title } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify inspection exists
    let inspection = null;
    if (inspectionId) {
      inspection = await Inspection.findByPk(inspectionId);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
    }

    // Only drafter can generate reports
    if (req.user.role !== 'drafter') {
      return res.status(403).json({ error: 'Not authorized to generate reports' });
    }

    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '..', '..', 'uploads', 'reports');
    await fs.ensureDir(reportsDir);

    // Generate DOCX filename
    const filename = `report-${project.id}-${Date.now()}.docx`;
    const filePath = path.join(reportsDir, filename);

    // Create simple DOCX content (placeholder)
    const docxContent = `
      Laporan SLF - ${project.name}
      
      Tanggal: ${new Date().toLocaleDateString('id-ID')}
      
      Data Proyek:
      - Nama Proyek: ${project.name}
      - Pemilik: ${project.owner_name}
      - Alamat: ${project.address}
      - Fungsi Bangunan: ${project.building_function}
      - Jumlah Lantai: ${project.floors}
      - Tinggi Bangunan: ${project.height} meter
      - Luas Bangunan: ${project.area} m²
      
      Laporan ini dibuat oleh ${req.user.name}.
    `;

    // Write DOCX file
    await fs.writeFile(filePath, docxContent);

    // Create report record
    const report = await Report.create({
      project_id: projectId,
      inspection_id: inspectionId,
      title: title || `Laporan SLF - ${project.name}`,
      file_path: path.join('reports', filename),
      file_type: 'docx',
      status: 'generated',
      generated_by: req.user.id
    });

    res.json({
      message: 'DOCX report generated successfully',
      report: {
        id: report.id,
        title: report.title,
        file_path: `/uploads/${report.file_path}`,
        status: report.status
      }
    });

  } catch (error) {
    console.error('Generate DOCX report error:', error);
    res.status(500).json({ error: 'Server error while generating DOCX report' });
  }
};

/**
 * Helper function to generate PDF content
 * @param {PDFDocument} doc 
 * @param {object} data 
 */
async function generatePDFContent(doc, data) {
  const { project, inspection, checklistResponses, simakResponses, photos, generatedBy } = data;

  // Header
  doc.fontSize(18).text('LAPORAN PEMERIKSAAN KELAIKAN FUNGSI', { align: 'center' });
  doc.fontSize(14).text('SERTIFIKAT LAIK FUNGSI (SLF)', { align: 'center' });
  doc.moveDown();

  // Project Information
  doc.fontSize(12).text('DATA PROYEK', { underline: true });
  doc.moveDown();
  doc.fontSize(10);
  doc.text(`Nama Proyek: ${project.name}`);
  doc.text(`Pemilik: ${project.owner_name}`);
  doc.text(`Alamat: ${project.address}`);
  doc.text(`Fungsi Bangunan: ${project.building_function}`);
  doc.text(`Jumlah Lantai: ${project.floors}`);
  if (project.height) doc.text(`Tinggi Bangunan: ${project.height} meter`);
  if (project.area) doc.text(`Luas Bangunan: ${project.area} m²`);
  if (project.location) doc.text(`Lokasi: ${project.location}`);
  doc.moveDown();

  // Inspection Information
  if (inspection) {
    doc.fontSize(12).text('DATA INSPEKSI', { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Tanggal Inspeksi: ${inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') : 'Belum dijadwalkan'}`);
    doc.text(`Status Inspeksi: ${inspection.status}`);
    doc.moveDown();
  }

  // Checklist Results
  if (checklistResponses && checklistResponses.length > 0) {
    doc.fontSize(12).text('HASIL CHECKLIST PEMERIKSAAN', { underline: true });
    doc.moveDown();

    // Group by category
    const groupedChecklist = {};
    checklistResponses.forEach(response => {
      const category = response.checklistItem.category;
      if (!groupedChecklist[category]) {
        groupedChecklist[category] = [];
      }
      groupedChecklist[category].push(response);
    });

    Object.keys(groupedChecklist).forEach(category => {
      doc.fontSize(11).text(category, { bold: true });
      doc.moveDown();

      groupedChecklist[category].forEach((response, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. [${response.checklistItem.code}] ${response.checklistItem.description}`);
        if (response.sample_number) {
          doc.text(`   Sample: ${response.sample_number}`);
        }
        if (response.response_data) {
          Object.keys(response.response_data).forEach(key => {
            doc.text(`   ${key}: ${response.response_data[key]}`);
          });
        }
        doc.moveDown();
      });
    });
  }

  // Simak Results
  if (simakResponses && simakResponses.length > 0) {
    doc.addPage();
    doc.fontSize(12).text('DAFTAR SIMAK', { underline: true });
    doc.moveDown();

    // Group by category
    const groupedSimak = {};
    simakResponses.forEach(response => {
      const category = response.simakItem.category;
      if (!groupedSimak[category]) {
        groupedSimak[category] = [];
      }
      groupedSimak[category].push(response);
    });

    Object.keys(groupedSimak).forEach(category => {
      doc.fontSize(11).text(category, { bold: true });
      doc.moveDown();

      groupedSimak[category].forEach((response, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. [${response.simakItem.code}] ${response.simakItem.description}`);
        if (response.sample_number) {
          doc.text(`   Sample: ${response.sample_number}`);
        }
        if (response.location_detail) {
          doc.text(`   Lokasi: ${response.location_detail}`);
        }
        if (response.year_built) {
          doc.text(`   Tahun Dibangun: ${response.year_built}`);
        }
        if (response.size) {
          doc.text(`   Ukuran: ${response.size}`);
        }
        if (response.material) {
          doc.text(`   Material: ${response.material}`);
        }
        if (response.damage_level) {
          doc.text(`   Tingkat Kerusakan: ${response.damage_level}`);
        }
        if (response.specific_damage) {
          doc.text(`   Kerusakan Spesifik: ${response.specific_damage}`);
        }
        if (response.overall_condition) {
          doc.text(`   Kondisi Keseluruhan: ${response.overall_condition}`);
        }
        if (response.estimated_useful_life) {
          doc.text(`   Estimasi Sisa Umur: ${response.estimated_useful_life} tahun`);
        }
        if (response.conclusion) {
          doc.text(`   Kesimpulan: ${response.conclusion}`);
        }
        doc.moveDown();
      });
    });
  }

  // Photos
  if (photos && photos.length > 0) {
    doc.addPage();
    doc.fontSize(12).text('DOKUMENTASI FOTO', { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Total foto: ${photos.length} lembar`);
    doc.moveDown();

    photos.forEach((photo, index) => {
      doc.text(`${index + 1}. ${photo.caption || 'Foto dokumentasi'}`);
      if (photo.floor_info) {
        doc.text(`   Lantai: ${photo.floor_info}`);
      }
      if (photo.latitude && photo.longitude) {
        doc.text(`   Koordinat: ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`);
      }
      doc.text(`   Diunggah oleh ${photo.uploader?.name || 'Unknown'} pada ${new Date(photo.created_at).toLocaleDateString('id-ID')}`);
      doc.moveDown();
    });
  }

  // Conclusion
  doc.addPage();
  doc.fontSize(12).text('KESIMPULAN DAN REKOMENDASI', { underline: true });
  doc.moveDown();
  doc.fontSize(10);
  doc.text('Berdasarkan hasil pemeriksaan di lapangan, dapat disimpulkan bahwa:');
  doc.moveDown();
  doc.text('[Kesimpulan dan rekomendasi akan diisi oleh Drafter]');
  doc.moveDown();
  doc.text('Bangunan dinyatakan [LAIK/TIDAK LAIK] FUNGSI untuk digunakan sesuai dengan fungsi bangunan yang direncanakan.');
  doc.moveDown();

  // Signatures
  doc.moveDown(3);
  doc.fontSize(10);
  doc.text('Jakarta, _________________', { align: 'right' });
  doc.moveDown(2);
  doc.text('Tim Pemeriksa,', { align: 'right' });
  doc.moveDown(3);
  doc.text('_________________________', { align: 'right' });
  doc.text(`${generatedBy.name}`, { align: 'right' });
  doc.text(`(${generatedBy.role})`, { align: 'right' });

  // Footer
  doc.fontSize(8);
  doc.text('Laporan ini dibuat berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 27 Tahun 2018 dan Nomor 3 Tahun 2020', 50, doc.page.height - 50);
}

/**
 * Approve report by role
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only project_lead can approve reports
    if (req.user.role !== 'project_lead') {
      return res.status(403).json({ error: 'Not authorized to approve reports' });
    }

    // Update report status
    await report.update({
      status: 'project_lead_approved',
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      project_lead_comment: comment || null
    });

    // Send notification to head consultant
    const project = await Project.findByPk(report.project_id);
    if (project) {
      const headConsultant = await User.findOne({ where: { role: 'head_consultant' } });
      if (headConsultant) {
        await Notification.create({
          user_id: headConsultant.id,
          title: 'Report Needs Approval',
          message: `Report "${report.title}" for project "${project.name}" needs your approval.`,
          priority: 'medium',
          action_required: true,
          action_url: `/dashboard/head-consultant/reports/${report.id}`
        });
      }
    }

    res.json({
      message: 'Report approved successfully',
      report
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ error: 'Server error while approving report' });
  }
};

/**
 * Reject report by role
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only project_lead can reject reports
    if (req.user.role !== 'project_lead') {
      return res.status(403).json({ error: 'Not authorized to reject reports' });
    }

    // Update report status
    await report.update({
      status: 'project_lead_rejected',
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      project_lead_comment: comment || null
    });

    // Send notification to drafter
    const project = await Project.findByPk(report.project_id);
    if (project) {
      const drafter = await User.findByPk(report.generated_by);
      if (drafter) {
        await Notification.create({
          user_id: drafter.id,
          title: 'Report Rejected',
          message: `Report "${report.title}" for project "${project.name}" has been rejected. Please revise.`,
          priority: 'high',
          action_required: true,
          action_url: `/dashboard/drafter/reports/${report.id}`
        });
      }
    }

    res.json({
      message: 'Report rejected successfully',
      report
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ error: 'Server error while rejecting report' });
  }
};

/**
 * Send report to client
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.sendToClient = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only head_consultant can send reports to client
    if (req.user.role !== 'head_consultant') {
      return res.status(403).json({ error: 'Not authorized to send reports to client' });
    }

    // Update report status
    await report.update({
      status: 'sent_to_client',
      sent_to_client_at: new Date()
    });

    // Send notification to client
    const project = await Project.findByPk(report.project_id);
    if (project && project.client_id) {
      await Notification.create({
        user_id: project.client_id,
        title: 'New Report Available',
        message: `Report "${report.title}" for project "${project.name}" is now available for your review.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/client/reports/${report.id}`
      });
    }

    res.json({
      message: 'Report sent to client successfully',
      report
    });
  } catch (error) {
    console.error('Send to client error:', error);
    res.status(500).json({ error: 'Server error while sending report to client' });
  }
};

/**
 * Get client approval
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getClientApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only klien can approve reports
    if (req.user.role !== 'klien') {
      return res.status(403).json({ error: 'Not authorized to approve reports' });
    }

    // Verify client owns this project
    const project = await Project.findByPk(report.project_id);
    if (!project || project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this report' });
    }

    res.json({
      report_id: report.id,
      status: report.status,
      client_approved: report.status === 'client_approved',
      client_rejected: report.status === 'client_rejected',
      client_approved_at: report.client_approved_at,
      client_rejected_at: report.client_rejected_at,
      client_comment: report.client_comment
    });
  } catch (error) {
    console.error('Get client approval error:', error);
    res.status(500).json({ error: 'Server error while fetching client approval' });
  }
};

/**
 * Submit to government
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.submitToGovernment = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only klien can submit to government
    if (req.user.role !== 'klien') {
      return res.status(403).json({ error: 'Not authorized to submit to government' });
    }

    // Verify client owns this project
    const project = await Project.findByPk(report.project_id);
    if (!project || project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this report' });
    }

    // Update report status
    await report.update({
      status: 'submitted_to_government',
      submitted_to_gov_at: new Date()
    });

    // Update project status
    await project.update({
      status: 'submitted_to_government'
    });

    // Send notification to relevant parties
    await Notification.create({
      user_id: project.project_lead_id,
      title: 'Report Submitted to Government',
      message: `Report "${report.title}" for project "${project.name}" has been submitted to government.`,
      priority: 'medium',
      action_required: false,
      action_url: `/dashboard/project-lead/projects/${project.id}/reports/${report.id}`
    });

    res.json({
      message: 'Report submitted to government successfully',
      report
    });
  } catch (error) {
    console.error('Submit to government error:', error);
    res.status(500).json({ error: 'Server error while submitting to government' });
  }
};

/**
 * Get SLF issued status
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getSLFIssued = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only klien can check SLF issued status
    if (req.user.role !== 'klien') {
      return res.status(403).json({ error: 'Not authorized to check SLF issued status' });
    }

    // Verify client owns this project
    const project = await Project.findByPk(report.project_id);
    if (!project || project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this report' });
    }

    res.json({
      report_id: report.id,
      slf_issued: report.status === 'slf_issued',
      slf_issued_at: report.slf_issued_at,
      completed: report.status === 'completed'
    });
  } catch (error) {
    console.error('Get SLF issued error:', error);
    res.status(500).json({ error: 'Server error while checking SLF issued status' });
  }
};

/**
 * Get report status
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getReportStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      report_id: report.id,
      status: report.status,
      file_path: report.file_path,
      file_type: report.file_type,
      generated_by: report.generated_by,
      reviewed_by: report.reviewed_by,
      reviewed_at: report.reviewed_at,
      sent_to_client_at: report.sent_to_client_at,
      submitted_to_gov_at: report.submitted_to_gov_at,
      client_approved_at: report.client_approved_at,
      client_rejected_at: report.client_rejected_at,
      slf_issued_at: report.slf_issued_at,
      completed_at: report.completed_at
    });
  } catch (error) {
    console.error('Get report status error:', error);
    res.status(500).json({ error: 'Server error while fetching report status' });
  }
};