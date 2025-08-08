// server/src/controllers/checklistController.js
const fs = require('fs').promises;
const path = require('path');
const ChecklistItem = require('../models/ChecklistItem');
const ChecklistResponse = require('../models/ChecklistResponse');
const Inspection = require('../models/Inspection');
const Project = require('../models/Project');
const SimakItem = require('../models/SimakItem');
const SimakResponse = require('../models/SimakResponse');

/**
 * Get checklist template from JSON file
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistTemplate = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../data/checklist_templates.json');
    const rawData = await fs.readFile(templatePath, 'utf8');
    const template = JSON.parse(rawData);
    
    res.json(template);
  } catch (error) {
    console.error('Get checklist template error:', error);
    res.status(500).json({ error: 'Gagal memuat template checklist' });
  }
};

/**
 * Get all checklist items from database
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistItems = async (req, res) => {
  try {
    const { category, applicable_for, search } = req.query;

    // Build where conditions
    const whereConditions = { is_active: true };
    
    if (category) {
      whereConditions.category = category;
    }

    if (search) {
      whereConditions.description = {
        [Sequelize.Op.iLike]: `%${search}%`
      };
    }

    let items;
    if (applicable_for) {
      // Get all items and filter by applicable_for
      const allItems = await ChecklistItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
      
      items = allItems.filter(item => {
        // If no applicable_for defined, assume it applies to all
        if (!item.applicable_for || item.applicable_for.length === 0) {
          return true;
        }
        // Check if the item applies to the specified type
        return item.applicable_for.includes(applicable_for);
      });
    } else {
      items = await ChecklistItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
    }

    res.json(items);
  } catch (error) {
    console.error('Get checklist items error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist items' });
  }
};

/**
 * Get checklist item by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get checklist item by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist item' });
  }
};

/**
 * Create new checklist item
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.createChecklistItem = async (req, res) => {
  try {
    const { code, category, description, column_config, applicable_for, is_active } = req.body;

    // Validate required fields
    if (!code || !category || !description || !column_config) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if item already exists
    const existingItem = await ChecklistItem.findOne({ where: { code } });
    if (existingItem) {
      return res.status(400).json({ error: 'Checklist item with this code already exists' });
    }

    // Create new checklist item
    const item = await ChecklistItem.create({
      code,
      category,
      description,
      column_config,
      applicable_for: applicable_for || null,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create checklist item error:', error);
    res.status(500).json({ error: 'Server error while creating checklist item' });
  }
};

/**
 * Update checklist item
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, category, description, column_config, applicable_for, is_active } = req.body;

    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Update item
    await item.update({
      code: code || item.code,
      category: category || item.category,
      description: description || item.description,
      column_config: column_config || item.column_config,
      applicable_for: applicable_for !== undefined ? applicable_for : item.applicable_for,
      is_active: is_active !== undefined ? is_active : item.is_active
    });

    res.json(item);
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Server error while updating checklist item' });
  }
};

/**
 * Delete checklist item
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Check if item has any responses
    const responseCount = await ChecklistResponse.count({
      where: { checklist_item_id: id }
    });

    if (responseCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete checklist item that has responses' 
      });
    }

    // Delete item
    await item.destroy();

    res.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ error: 'Server error while deleting checklist item' });
  }
};

/**
 * Get checklist responses for an inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistResponses = async (req, res) => {
  try {
    const { inspectionId } = req.params;

    // Verify inspection exists
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Get checklist responses with item details
    const responses = await ChecklistResponse.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: ChecklistItem,
        as: 'checklistItem',
        attributes: ['id', 'code', 'category', 'description', 'column_config']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(responses);
  } catch (error) {
    console.error('Get checklist responses error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist responses' });
  }
};

/**
 * Add checklist response for an inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.addChecklistResponse = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const { checklist_item_id, sample_number, response_data } = req.body;

    // Verify inspection exists
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Verify checklist item exists
    const checklistItem = await ChecklistItem.findByPk(checklist_item_id);
    if (!checklistItem) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Check if response already exists for this item and inspection
    const existingResponse = await ChecklistResponse.findOne({
      where: {
        inspection_id: inspectionId,
        checklist_item_id: checklist_item_id,
        sample_number: sample_number || null
      }
    });

    if (existingResponse) {
      return res.status(400).json({ 
        error: 'Checklist response for this item and sample number already exists' 
      });
    }

    // Create checklist response
    const response = await ChecklistResponse.create({
      inspection_id: parseInt(inspectionId),
      checklist_item_id: checklist_item_id,
      sample_number: sample_number || null,
      response_ response_data || {}
    });

    // Include checklist item data in response
    response.dataValues.checklistItem = checklistItem;

    res.status(201).json(response);
  } catch (error) {
    console.error('Add checklist response error:', error);
    res.status(500).json({ error: 'Server error while adding checklist response' });
  }
};

/**
 * Update checklist response
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateChecklistResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { response_data } = req.body;

    const response = await ChecklistResponse.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ error: 'Checklist response not found' });
    }

    // Update response
    await response.update({
      response_ response_data || response.response_data
    });

    res.json(response);
  } catch (error) {
    console.error('Update checklist response error:', error);
    res.status(500).json({ error: 'Server error while updating checklist response' });
  }
};

/**
 * Delete checklist response
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteChecklistResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await ChecklistResponse.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ error: 'Checklist response not found' });
    }

    // Delete response
    await response.destroy();

    res.json({ message: 'Checklist response deleted successfully' });
  } catch (error) {
    console.error('Delete checklist response error:', error);
    res.status(500).json({ error: 'Server error while deleting checklist response' });
  }
};

/**
 * Get simak items
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getSimakItems = async (req, res) => {
  try {
    const { category, applicable_for, search } = req.query;

    // Build where conditions
    const whereConditions = { is_active: true };
    
    if (category) {
      whereConditions.category = category;
    }

    if (search) {
      whereConditions.description = {
        [Sequelize.Op.iLike]: `%${search}%`
      };
    }

    let items;
    if (applicable_for) {
      // Get all items and filter by applicable_for
      const allItems = await SimakItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
      
      items = allItems.filter(item => {
        // If no applicable_for defined, assume it applies to all
        if (!item.applicable_for || item.applicable_for.length === 0) {
          return true;
        }
        // Check if the item applies to the specified type
        return item.applicable_for.includes(applicable_for);
      });
    } else {
      items = await SimakItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
    }

    res.json(items);
  } catch (error) {
    console.error('Get simak items error:', error);
    res.status(500).json({ error: 'Server error while fetching simak items' });
  }
};

/**
 * Get simak responses for an inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getSimakResponses = async (req, res) => {
  try {
    const { inspectionId } = req.params;

    // Verify inspection exists
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Get simak responses with item details
    const responses = await SimakResponse.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: SimakItem,
        as: 'simakItem',
        attributes: ['id', 'code', 'category', 'description']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(responses);
  } catch (error) {
    console.error('Get simak responses error:', error);
    res.status(500).json({ error: 'Server error while fetching simak responses' });
  }
};

/**
 * Add simak response for an inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.addSimakResponse = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const { simak_item_id, sample_number, response_data } = req.body;

    // Verify inspection exists
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Verify simak item exists
    const simakItem = await SimakItem.findByPk(simak_item_id);
    if (!simakItem) {
      return res.status(404).json({ error: 'Simak item not found' });
    }

    // Check if response already exists for this item and inspection
    const existingResponse = await SimakResponse.findOne({
      where: {
        inspection_id: inspectionId,
        simak_item_id: simak_item_id,
        sample_number: sample_number || null
      }
    });

    if (existingResponse) {
      return res.status(400).json({ 
        error: 'Simak response for this item and sample number already exists' 
      });
    }

    // Create simak response
    const response = await SimakResponse.create({
      inspection_id: parseInt(inspectionId),
      simak_item_id: simak_item_id,
      sample_number: sample_number || null,
      response_ response_data || {}
    });

    // Include simak item data in response
    response.dataValues.simakItem = simakItem;

    res.status(201).json(response);
  } catch (error) {
    console.error('Add simak response error:', error);
    res.status(500).json({ error: 'Server error while adding simak response' });
  }
};

module.exports = {
  getChecklistTemplate,
  getChecklistItems,
  getChecklistItemById,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklistResponses,
  addChecklistResponse,
  updateChecklistResponse,
  deleteChecklistResponse,
  getSimakItems,
  getSimakResponses,
  addSimakResponse
};