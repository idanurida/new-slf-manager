// server/src/controllers/projectController.js
const Project = require('../models/Project');
const User = require('../models/User');
const Inspection = require('../models/Inspection');
const ChecklistResponse = require('../models/ChecklistResponse');
const SimakResponse = require('../models/SimakResponse');
const Photo = require('../models/Photo');
const Report = require('../models/Report');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * Get all projects with filters
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjects = async (req, res) => {
  try {
    const { status, request_type, search, limit = 20, offset = 0 } = req.query;

    // Build where conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (request_type) {
      whereConditions.request_type = request_type;
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { owner_name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add role-based filtering
    if (req.user.role === 'klien') {
      whereConditions.client_id = req.user.id;
    } else if (req.user.role === 'project_lead') {
      whereConditions.project_lead_id = req.user.id;
    }

    const projects = await Project.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'projectLead',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      projects: projects.rows,
      total: projects.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

/**
 * Get project by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'projectLead',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Inspection,
          as: 'inspections',
          attributes: ['id', 'scheduled_date', 'completed_date', 'status']
        },
        {
          model: Report,
          as: 'reports',
          attributes: ['id', 'title', 'status', 'file_path']
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'status', 'payment_date']
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'title', 'type', 'file_path']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Role-based access control
    if (req.user.role === 'klien' && project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    if (req.user.role === 'project_lead' && project.project_lead_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching project' });
  }
};

/**
 * Create new project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      owner_name,
      address,
      building_function,
      floors,
      height,
      area,
      location,
      coordinates,
      request_type,
      project_lead_id,
      client_id
    } = req.body;

    // Validate required fields
    if (!name || !owner_name || !address || !building_function || !floors || !request_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create project
    const project = await Project.create({
      name,
      owner_name,
      address,
      building_function,
      floors: parseInt(floors),
      height: height ? parseFloat(height) : null,
      area: area ? parseFloat(area) : null,
      location: location || null,
      coordinates: coordinates || null,
      request_type,
      project_lead_id: project_lead_id || req.user.id,
      client_id: client_id || null,
      status: 'draft',
      created_by: req.user.id,
      updated_by: req.user.id
    });

    // Send notification to project lead
    if (project_lead_id) {
      await Notification.create({
        user_id: project_lead_id,
        title: 'New Project Assigned',
        message: `You have been assigned to project: ${project.name}`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/project-lead/projects/${project.id}`
      });
    }

    // Send notification to client
    if (client_id) {
      await Notification.create({
        user_id: client_id,
        title: 'New Project Created',
        message: `New project "${project.name}" has been created for you.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/client/projects/${project.id}`
      });
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error while creating project' });
  }
};

/**
 * Update project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Role-based access control
    if (req.user.role === 'klien' && project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    if (req.user.role === 'project_lead' && project.project_lead_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    // Update project
    await project.update({
      ...updateData,
      updated_by: req.user.id
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error while updating project' });
  }
};

/**
 * Delete project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only superadmin can delete projects
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized to delete projects' });
    }

    // Delete project
    await project.destroy();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
};

/**
 * Get project status
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      attributes: ['id', 'name', 'status', 'request_type']
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      id: project.id,
      name: project.name,
      status: project.status,
      request_type: project.request_type
    });
  } catch (error) {
    console.error('Get project status error:', error);
    res.status(500).json({ error: 'Server error while fetching project status' });
  }
};

/**
 * Assign project lead to project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.assignProjectLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_lead_id } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only head_consultant and superadmin can assign project lead
    if (!['head_consultant', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to assign project lead' });
    }

    // Verify user exists and is project_lead
    const user = await User.findByPk(project_lead_id);
    if (!user || user.role !== 'project_lead') {
      return res.status(400).json({ error: 'Invalid project lead' });
    }

    // Update project
    await project.update({ project_lead_id });

    // Send notification
    await Notification.create({
      user_id: project_lead_id,
      title: 'Project Lead Assignment',
      message: `You have been assigned as project lead for: ${project.name}`,
      priority: 'medium',
      action_required: true,
      action_url: `/dashboard/project-lead/projects/${project.id}`
    });

    res.json({
      message: 'Project lead assigned successfully',
      project
    });
  } catch (error) {
    console.error('Assign project lead error:', error);
    res.status(500).json({ error: 'Server error while assigning project lead' });
  }
};

/**
 * Assign client to project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.assignClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only head_consultant and superadmin can assign client
    if (!['head_consultant', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to assign client' });
    }

    // Verify user exists and is klien
    const user = await User.findByPk(client_id);
    if (!user || user.role !== 'klien') {
      return res.status(400).json({ error: 'Invalid client' });
    }

    // Update project
    await project.update({ client_id });

    // Send notification
    await Notification.create({
      user_id: client_id,
      title: 'Project Client Assignment',
      message: `You have been assigned as client for project: ${project.name}`,
      priority: 'medium',
      action_required: true,
      action_url: `/dashboard/client/projects/${project.id}`
    });

    res.json({
      message: 'Client assigned successfully',
      project
    });
  } catch (error) {
    console.error('Assign client error:', error);
    res.status(500).json({ error: 'Server error while assigning client' });
  }
};

/**
 * Get my projects (for logged in user)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getMyProjects = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    let whereConditions = {};

    switch (req.user.role) {
      case 'klien':
        whereConditions.client_id = req.user.id;
        break;
      case 'project_lead':
        whereConditions.project_lead_id = req.user.id;
        break;
      case 'head_consultant':
      case 'superadmin':
        // No filter for head consultant and superadmin
        break;
      default:
        return res.status(403).json({ error: 'Not authorized to access projects' });
    }

    const projects = await Project.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'projectLead',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      projects: projects.rows,
      total: projects.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatus,
  assignProjectLead,
  assignClient,
  getMyProjects
};