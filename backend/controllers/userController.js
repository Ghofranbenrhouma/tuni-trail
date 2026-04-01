const pool = require('../config/db');

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, phone, bio, avatar, role, activities, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar, activities } = req.body;
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), activities = COALESCE(?, activities) WHERE id = ?',
      [name, phone, bio, avatar, activities ? JSON.stringify(activities) : null, req.user.id]
    );
    const [rows] = await pool.query('SELECT id, email, name, phone, bio, avatar, role, activities, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/users  (admin)
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, phone, avatar, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/users/:id  (admin)
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, phone, bio, avatar, role, activities, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};
