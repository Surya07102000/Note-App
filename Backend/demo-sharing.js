const mongoose = require('mongoose');
const config = require('./config/config');
const Note = require('./models/Note');
const User = require('./models/user');

async function demonstrateSharing() {
  console.log('🎯 Note Sharing Demonstration\n');
  
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Get all users
    const users = await User.find().select('name email');
    console.log(`\n👥 Available users (${users.length}):`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Get notes
    const notes = await Note.find()
      .populate('user', 'name email')
      .select('title content tags isArchived sharedWith')
      .limit(5);
    
    console.log(`\n📝 Available notes (${notes.length}):`);
    notes.forEach((note, index) => {
      console.log(`  ${index + 1}. "${note.title}" by ${note.user.name}`);
      console.log(`     Tags: ${note.tags.join(', ')}`);
      console.log(`     Archived: ${note.isArchived ? 'Yes' : 'No'}`);
      console.log(`     Shared with: ${note.sharedWith?.length || 0} users`);
      if (note.sharedWith && note.sharedWith.length > 0) {
        note.sharedWith.forEach(share => {
          console.log(`       - ${share.user.name} (${share.permission})`);
        });
      }
      console.log('');
    });
    
    console.log('🎉 Sharing functionality is ready!');
    console.log('\n📋 How to share notes:');
    console.log('1. Open your browser and go to http://localhost:4200');
    console.log('2. Login with your credentials');
    console.log('3. Click on "Notes" in the navigation');
    console.log('4. Find a note you own and click the 📤 Share button');
    console.log('5. Select a user and set permissions (Read/Write)');
    console.log('6. Click "Share Note" to complete');
    
    console.log('\n🔧 Sharing Features:');
    console.log('✅ Share with any user in the system');
    console.log('✅ Set read-only or read-write permissions');
    console.log('✅ Update permissions after sharing');
    console.log('✅ Remove sharing at any time');
    console.log('✅ View shared notes as recipient');
    console.log('✅ Permission-based editing control');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

demonstrateSharing(); 