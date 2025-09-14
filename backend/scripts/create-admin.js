const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@filmscape.com' } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@filmscape.com');
      console.log('🔑 Password: admin123');
      console.log('🛡️ Admin privileges: Enabled');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@filmscape.com',
      password_hash: hashedPassword,
      is_admin: true,
      profile_picture: null,
      bio: 'System Administrator',
      is_verified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@filmscape.com');
    console.log('🔑 Password: admin123');
    console.log('🛡️ Admin privileges: Enabled');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdmin().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
