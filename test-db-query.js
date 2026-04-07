const { db } = require('./backend/models/db');

async function test() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');

    // Test raw query
    const result = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM community_posts',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    console.log('Raw query result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

test();
