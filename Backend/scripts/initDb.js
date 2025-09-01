const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const defaultRoles = [
  {
    name: 'admin',
    permissions: ['all'],
    description: 'Administrator with full access'
  },
  {
    name: 'user',
    permissions: ['read:own', 'write:own'],
    description: 'Regular user with limited access'
  }
];

const initDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing roles and users
    await Role.deleteMany({});
    console.log('Cleared existing roles');
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create default roles
    const createdRoles = await Role.insertMany(defaultRoles);
    console.log('Created default roles');

    // Find the admin role
    const adminRole = createdRoles.find(role => role.name === 'admin');

    if (adminRole) {
      // Create a default admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: adminRole._id
      });
      console.log(`Created default admin user: ${adminUser.email}`);
    } else {
      console.warn('Admin role not found, could not create default admin user.');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb(); 