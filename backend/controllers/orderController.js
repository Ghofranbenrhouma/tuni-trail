const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/orders
exports.getMine = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/orders
exports.create = async (req, res, next) => {
  try {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items requis' });
    if (total === undefined || total === null || typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Total requis et doit être > 0' });
    }

    const refCode = 'TT-' + uuidv4().substring(0, 8).toUpperCase();

    const [result] = await pool.query(
      'INSERT INTO orders (ref_code, user_id, items, total, status) VALUES (?, ?, ?, ?, ?)',
      [refCode, req.user.id, JSON.stringify(items), total, 'confirmed']
    );

    // Clear user's cart after order
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};
