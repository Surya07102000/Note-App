const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/user');
const Role = require('./models/Role');

async function setUserRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Find the admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.error('Admin role not found');
      return;
    }
    console.log('Found admin role:', adminRole._id);

    // Find the user by email
    const user = await User.findOne({ email: 'suryakantanag05@gmail.com' });
    if (!user) {
      console.error('User not found');
      return;
    }
    console.log('Found user:', user.email);

    // Update user's role to admin
    user.role = adminRole._id;
    await user.save();
    
    console.log('✅ Successfully updated user role to admin');
    console.log('User:', user.email);
    console.log('Role:', adminRole.name);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setUserRole(); 