const { sequelize, User } = require('./backend/models');

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test User model
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Test creating a user
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password_here'
    });
    console.log('✅ Test user created successfully');
    
    // Clean up test user
    await testUser.destroy();
    console.log('✅ Test user cleaned up');
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
