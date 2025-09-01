const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/user');

async function checkUsers() {
  console.log('👥 Checking users in database...');
  
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const users = await User.find().select('name email createdAt');
    console.log(`\n📊 Found ${users.length} users in database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers(); 