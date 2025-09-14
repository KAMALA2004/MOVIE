const { sequelize, User, Movie, Review, Watchlist } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully');
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@filmscape.com' } });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash('admin123', 12);
      
      await User.create({
        username: 'admin',
        email: 'admin@filmscape.com',
        password_hash,
        is_admin: true,
        bio: 'System Administrator'
      });
      console.log('✅ Admin user created (email: admin@filmscape.com, password: admin123)');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Database ready for use');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
