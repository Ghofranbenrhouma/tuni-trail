const pool = require('../config/db');

// GET /api/wishlist
exports.get = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT wi.id, wi.product_id, p.name, p.price, p.price_num, p.icon, p.category, p.css_class, p.badge, p.badge_cls, p.rating, p.description
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       WHERE wi.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/wishlist  (toggle)
exports.toggle = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id requis' });

    const [existing] = await pool.query(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist_items WHERE id = ?', [existing[0].id]);
      res.json({ success: true, action: 'removed' });
    } else {
      await pool.query('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
      res.json({ success: true, action: 'added' });
    }
  } catch (err) { next(err); }
};
