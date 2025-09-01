const mongoose = require('mongoose');
const config = require('./config/config');

// Import the Note model
const Note = require('./models/Note');
const User = require('./models/user');

async function checkNotesInDatabase() {
  console.log('Checking notes in database...');
  console.log('MongoDB URI:', config.mongoURI);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Check users collection
    const userCount = await User.countDocuments();
    console.log(`\n📊 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('name email createdAt').limit(5);
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Created: ${user.createdAt}`);
      });
    }
    
    // Check notes collection
    const noteCount = await Note.countDocuments();
    console.log(`\n📝 Notes in database: ${noteCount}`);
    
    if (noteCount > 0) {
      const notes = await Note.find()
        .populate('user', 'name email')
        .select('title content tags isArchived createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log('\nRecent notes:');
      notes.forEach((note, index) => {
        console.log(`\n${index + 1}. ${note.title}`);
        console.log(`   Content: ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}`);
        console.log(`   Tags: ${note.tags.join(', ')}`);
        console.log(`   Archived: ${note.isArchived ? 'Yes' : 'No'}`);
        console.log(`   Owner: ${typeof note.user === 'object' ? note.user.name : 'Unknown'}`);
        console.log(`   Created: ${note.createdAt}`);
        console.log(`   Updated: ${note.updatedAt}`);
        if (note.sharedWith && note.sharedWith.length > 0) {
          console.log(`   Shared with: ${note.sharedWith.length} users`);
        }
      });
    } else {
      console.log('\n❌ No notes found in database');
      console.log('This could mean:');
      console.log('1. No notes have been created yet');
      console.log('2. Notes are being saved to a different database');
      console.log('3. There\'s an issue with the note creation process');
    }
    
    // Check database stats
    const dbStats = await mongoose.connection.db.stats();
    console.log(`\n📈 Database stats:`);
    console.log(`   Database name: ${dbStats.db}`);
    console.log(`   Collections: ${dbStats.collections}`);
    console.log(`   Data size: ${(dbStats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage size: ${(dbStats.storageSize / 1024).toFixed(2)} KB`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkNotesInDatabase(); 