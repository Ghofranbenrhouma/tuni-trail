const pool = require('../config/db');

// GET /api/community/posts
exports.getPosts = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50');

    // Check if current user liked each post
    if (req.user) {
      const [likes] = await pool.query('SELECT post_id FROM post_likes WHERE user_id = ?', [req.user.id]);
      const likedSet = new Set(likes.map(l => l.post_id));
      rows.forEach(p => { p.liked = likedSet.has(p.id); });
    }

    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/community/posts
exports.createPost = async (req, res, next) => {
  try {
    const { location, image, caption } = req.body;
    if (!caption) return res.status(400).json({ error: 'Caption requise' });

    const [userRows] = await pool.query('SELECT name, avatar FROM users WHERE id = ?', [req.user.id]);
    const u = userRows[0] || {};

    const [result] = await pool.query(
      'INSERT INTO community_posts (user_id, author_name, author_avatar, location, image, caption) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, u.name || 'Utilisateur', u.avatar || 'U', location, image, caption]
    );

    const [rows] = await pool.query('SELECT * FROM community_posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/community/posts/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const [existing] = await pool.query('SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);

    if (existing.length > 0) {
      await pool.query('DELETE FROM post_likes WHERE id = ?', [existing[0].id]);
      await pool.query('UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?', [postId]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId]);
      await pool.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      res.json({ liked: true });
    }
  } catch (err) { next(err); }
};

// GET /api/community/chat
exports.getChat = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 100');
    res.json(rows.reverse());
  } catch (err) { next(err); }
};

// POST /api/community/chat
exports.sendChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message requis' });

    const [userRows] = await pool.query('SELECT name, avatar FROM users WHERE id = ?', [req.user.id]);
    const u = userRows[0] || {};

    const [result] = await pool.query(
      'INSERT INTO chat_messages (user_id, author_name, author_avatar, message, is_ai) VALUES (?, ?, ?, ?, FALSE)',
      [req.user.id, u.name || 'Utilisateur', u.avatar || 'U', message]
    );

    const [rows] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};
