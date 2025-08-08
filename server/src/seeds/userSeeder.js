// server/src/seeds/userSeeder.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding default user...');

    // Check if user already exists to prevent duplicates
    const existingUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (existingUser) {
      console.log('Default user already exists. Skipping seeding.');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.create({
      email: 'test@example.com',
      password_hash: hashedPassword,
      name: 'Test User',
      role: 'superadmin',
      phone: '1234567890',
      company: 'Test Company'
    });

    console.log('✅ Default user seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding default user:', error);
  }
};

module.exports = seedUsers;
