const pool = require('../config/db');

// GET /api/destinations
exports.getAll = async (req, res, next) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM destinations';
    const params = [];

    if (type && type !== 'Tous') { sql += ' WHERE type = ?'; params.push(type); }
    sql += ' ORDER BY id ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/destinations/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Destination introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};
