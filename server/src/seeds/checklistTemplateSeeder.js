// server/src/seeds/checklistTemplateSeeder.js
const fs = require('fs').promises;
const path = require('path');
const ChecklistItem = require('../models/ChecklistItem');

const seedChecklistTemplates = async () => {
  try {
    console.log('🌱 Seeding checklist templates...');
    
    // Check if already seeded
    const count = await ChecklistItem.count();
    if (count > 0) {
      console.log('✅ Checklist items already exist');
      return;
    }

    // Read template file
    const templatePath = path.join(__dirname, '../data/checklist_templates.json');
    const rawData = await fs.readFile(templatePath, 'utf8');
    const templates = JSON.parse(rawData);

    const itemsToCreate = [];

    // Process each template
    for (const template of templates.checklist_templates) {
      const { id: template_id, title, category, applicable_for: template_applicable_for, subsections = [] } = template;

      console.log(`📦 Processing template: ${title}`);

      // Process subsections
      for (const subsection of subsections) {
        const { id: subsection_id, title: subsection_title, applicable_for: subsection_applicable_for, items = [] } = subsection;
        
        const effective_applicable_for = subsection_applicable_for || template_applicable_for || [];
        
        console.log(`  └── Subsection: ${subsection_title}`);

        for (const item of items) {
          const { id, item_name, columns } = item;
          
          if (!id || !item_name || !columns) {
            console.warn(`    ⚠️  Skipping incomplete item:`, item);
            continue;
          }

          itemsToCreate.push({
            code: id,
            category: category,
            description: item_name,
            column_config: columns,
            applicable_for: effective_applicable_for.length > 0 ? effective_applicable_for : null,
            is_active: true
          });
          
          console.log(`    ➕ Adding item: ${id}`);
        }
      }
    }

    // Bulk create
    if (itemsToCreate.length > 0) {
      console.log(`💾 Creating ${itemsToCreate.length} checklist items...`);
      await ChecklistItem.bulkCreate(itemsToCreate);
      console.log('✅ Checklist templates seeded successfully!');
    }

  } catch (error) {
    console.error('❌ Error seeding checklist templates:', error);
  }
};

module.exports = seedChecklistTemplates;