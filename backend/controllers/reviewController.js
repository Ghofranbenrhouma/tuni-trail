const pool = require('../config/db');

// GET /api/reviews/event/:id
exports.getByEvent = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, u.avatar AS author_avatar
       FROM reviews r LEFT JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ? AND r.status = 'published'
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/reviews
exports.create = async (req, res, next) => {
  try {
    const { event_id, rating, comment } = req.body;
    if (!event_id) return res.status(400).json({ error: 'event_id requis' });
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating doit être un nombre entre 1 et 5' });
    }

    // Check for duplicate review (same user, same event)
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND event_id = ?',
      [req.user.id, event_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Vous avez déjà évalué cet événement' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, event_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, event_id, req.user.name || 'Anonyme', rating, comment]
    );

    // Update event rating
    const [stats] = await pool.query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE event_id = ? AND status = ?',
      [event_id, 'published']
    );
    if (stats[0]) {
      await pool.query('UPDATE events SET rating = ?, reviews_count = ? WHERE id = ?',
        [Math.round(stats[0].avg_rating * 10) / 10, stats[0].cnt, event_id]);
    }

    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/reviews/reported  (admin)
exports.getReported = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, e.title AS event_title
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN events e ON r.event_id = e.id
       WHERE r.status IN ('reported', 'pending')
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// PATCH /api/reviews/:id/moderate  (admin)
exports.moderate = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'delete'
    
    if (!['approve', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Action doit être "approve" ou "delete"' });
    }
    
    const newStatus = action === 'approve' ? 'published' : 'deleted';
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, status: newStatus });
  } catch (err) { next(err); }
};
