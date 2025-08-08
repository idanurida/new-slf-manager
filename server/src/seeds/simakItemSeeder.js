// server/src/seeds/simakItemSeeder.js
const fs = require('fs').promises;
const path = require('path');
const SimakItem = require('../models/SimakItem');

const seedSimakItems = async () => {
  try {
    console.log('🌱 Seeding Simak Items...');
    
    // Check if already seeded
    const count = await SimakItem.count();
    if (count > 0) {
      console.log('✅ Simak items already exist');
      return;
    }

    // Read template file
    const templatePath = path.join(__dirname, '../data/checklist_templates.json');
    const rawData = await fs.readFile(templatePath, 'utf8');
    const templates = JSON.parse(rawData);

    console.log(`📄 Template dimuat dari ${templatePath}`);
    console.log(`📊 Jumlah template: ${templates.checklist_templates.length}`);

    // Prepare items to create
    const itemsToCreate = [];

    // Process each template
    for (const template of templates.checklist_templates) {
      const { id: template_id, title, category, applicable_for: template_applicable_for, subsections = [], items: direct_items = [] } = template;

      console.log(`📦 Memproses template: ${title} (${template_id})`);

      // Process subsections if they exist
      if (subsections && subsections.length > 0) {
        for (const subsection of subsections) {
          const { id: subsection_id, title: subsection_title, applicable_for: subsection_applicable_for, items = [] } = subsection;
          
          // Determine applicable_for that is most specific
          const effective_applicable_for = subsection_applicable_for || template_applicable_for || [];
          
          console.log(`  └── Subsection: ${subsection_title} (${subsection_id}), Applicable for: [${effective_applicable_for.join(', ')}]`);

          // Iterate through each item in subsection
          for (const item of items) {
            const { id, item_name, columns } = item;
            
            // Basic validation
            if (!id || !item_name || !columns) {
              console.warn(`   ⚠️  Item tidak lengkap dilewati:`, item);
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
            
            console.log(`    ➕ Menambahkan item: ${id}`);
          }
        }
      } 
      // Process direct items if no subsections
      else if (direct_items && direct_items.length > 0) {
        console.log(`  └── Item langsung di bawah template, Applicable for: [${(template_applicable_for || []).join(', ')}]`);
        
        for (const item of direct_items) {
          const { id, item_name, columns } = item;
          
          if (!id || !item_name || !columns) {
            console.warn(`    ⚠️  Item tidak lengkap dilewati:`, item);
            continue;
          }

          itemsToCreate.push({
            code: id,
            category: category,
            description: item_name,
            column_config: columns,
            applicable_for: template_applicable_for || null,
            is_active: true
          });
          
          console.log(`    ➕ Menambahkan item: ${id}`);
        }
      }
    }

    // Bulk create if there are items
    if (itemsToCreate.length > 0) {
      console.log(`💾 Menyimpan ${itemsToCreate.length} item ke database...`);
      await SimakItem.bulkCreate(itemsToCreate);
      console.log(`✅ Berhasil menyimpan ${itemsToCreate.length} Simak item.`);
    } else {
      console.log('⚠️  Tidak ada item yang ditemukan untuk disimpan.');
    }

  } catch (error) {
    console.error('❌ Error saat seeding Simak items:', error);
    // Don't throw error so other seeders can still run
  }
};

module.exports = seedSimakItems;