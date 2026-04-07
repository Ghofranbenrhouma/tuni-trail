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
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/wishlist  (toggle)
exports.toggle = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id requis' });

    // Check if product exists
    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ error: 'Produit introuvable' });

    const [existing] = await pool.query(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist_items WHERE id = ?', [existing[0].id]);
      res.json({ success: true, action: 'removed', product: product[0] });
    } else {
      await pool.query('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
      res.json({ success: true, action: 'added', product: product[0] });
    }
  } catch (err) { next(err); }
};

// DELETE /api/wishlist/:id
exports.remove = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
