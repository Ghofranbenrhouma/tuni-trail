const pool = require('../config/db');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'Tous') { sql += ' AND category = ?'; params.push(category); }
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sort === 'price-asc') sql += ' ORDER BY price_num ASC';
    else if (sort === 'price-desc') sql += ' ORDER BY price_num DESC';
    else if (sort === 'rating') sql += ' ORDER BY rating DESC';
    else sql += ' ORDER BY reviews_count DESC'; // popular

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/products/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(['Tous', ...rows.map(r => r.category)]);
  } catch (err) { next(err); }
};
