const { db } = require('./models/db');

async function checkUsers() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected\n');

    const users = await db.User.findAll({ raw: true });
    console.log('📋 Seeded Users:');
    users.forEach(u => {
      console.log(`  ID: ${u.id}, Email: ${u.email}, Hash: ${u.password.substring(0, 20)}..., Role: ${u.role}`);
    });

    // Test password validation
    console.log('\n🔐 Testing password validation:');
    const user = await db.User.findOne({ where: { email: 'user@demo.com' } });
    if (user) {
      const isValid = await user.validatePassword('admin123');
      console.log(`  user@demo.com + 'admin123': ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
