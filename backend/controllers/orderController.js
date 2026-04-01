const pool = require('../config/db');

// GET /api/orders
exports.getMine = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/orders
exports.create = async (req, res, next) => {
  try {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items requis' });

    const refCode = 'TT-' + Date.now().toString().slice(-6);

    const [result] = await pool.query(
      'INSERT INTO orders (ref_code, user_id, items, total, status) VALUES (?, ?, ?, ?, ?)',
      [refCode, req.user.id, JSON.stringify(items), total || 0, 'confirmed']
    );

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};
