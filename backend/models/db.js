// ── Database Initialization Module ──────────────────────────────────────
// Centralized database connection and synchronization

const db = require('./index');

/**
 * Initialize database connection
 * Authenticates connection and optionally syncs models (dev only)
 */
async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection authenticated');

    // Sync models in development (creates tables if missing)
    // In production, use migrations instead
    if (process.env.NODE_ENV !== 'production') {
      // Note: Migrations should be run manually via `npm run db:migrate`
      // We don't auto-sync in any environment to maintain control
      console.log('📋 Run migrations manually: npm run db:migrate');
    }

    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}

/**
 * Gracefully close database connection
 */
async function closeDatabase() {
  try {
    await db.sequelize.close();
    console.log('✅ Database connection closed');
  } catch (err) {
    console.error('❌ Error closing database:', err.message);
  }
}

module.exports = {
  db,
  initializeDatabase,
  closeDatabase,
};
