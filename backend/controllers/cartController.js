const pool = require('../config/db');

// GET /api/cart
exports.get = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.price_num, p.icon, p.category, p.css_class, p.badge, p.badge_cls, p.rating
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/cart
exports.add = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id requis' });

    await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
      [req.user.id, product_id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PUT /api/cart/:id
exports.updateQty = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

// DELETE /api/cart/:id
exports.remove = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// DELETE /api/cart
exports.clear = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
