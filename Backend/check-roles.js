const mongoose = require('mongoose');
const config = require('./config/config');
const Role = require('./models/Role');

async function checkRoles() {
  console.log('🔍 Checking roles in database...');
  
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Check for roles
    const roles = await Role.find();
    console.log(`\n📊 Found ${roles.length} roles in database:`);
    
    if (roles.length === 0) {
      console.log('❌ No roles found! This will cause registration to fail.');
      console.log('Creating default roles...');
      
      // Create default roles
      const userRole = new Role({ name: 'user', description: 'Regular user' });
      const adminRole = new Role({ name: 'admin', description: 'Administrator' });
      
      await userRole.save();
      await adminRole.save();
      
      console.log('✅ Default roles created successfully!');
    } else {
      roles.forEach((role, index) => {
        console.log(`  ${index + 1}. ${role.name} - ${role.description}`);
      });
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRoles(); 