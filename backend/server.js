require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/reservations',  require('./routes/reservations'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/cart',           require('./routes/cart'));
app.use('/api/wishlist',      require('./routes/wishlist'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/community',     require('./routes/community'));
app.use('/api/destinations',  require('./routes/destinations'));
app.use('/api/org-requests',  require('./routes/orgRequests'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TuniTrail API is running 🏕️', timestamp: new Date().toISOString() });
});

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏕️  TuniTrail API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/api/health\n`);
});
