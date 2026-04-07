const { Op } = require('sequelize');
const { db } = require('../models/db');
const { CommunityPost, User } = db;
const { handleSequelizeError } = require('../utils/sequelize');

// ── Get community posts ────────────────────────────────────────────────
// GET /api/community/posts
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    // If user is logged in, check which posts they liked
    let likedPostIds = [];
    if (req.user?.id) {
      try {
        // Query the post_likes table directly for this user
        const likedPosts = await db.sequelize.query(
          'SELECT post_id FROM post_likes WHERE user_id = ?',
          { replacements: [req.user.id], type: db.Sequelize.QueryTypes.SELECT }
        );
        likedPostIds = likedPosts.map(l => l.post_id);
      } catch (err) {
        // post_likes table might not exist yet, just skip like tracking
        console.warn('Note: post_likes table not found, like tracking disabled');
      }
    }

    // Add liked flag to each post
    const enrichedPosts = posts.map(p => {
      const postData = p.toJSON();
      postData.liked = likedPostIds.includes(p.id);
      return postData;
    });

    res.json(enrichedPosts);
  } catch (err) {
    next(err);
  }
};

// ── Create community post ──────────────────────────────────────────────
// POST /api/community/posts
exports.createPost = async (req, res, next) => {
  try {
    const { location, image, caption } = req.body;

    // Validation
    if (!caption) {
      return res.status(400).json({ error: 'Caption requise' });
    }

    // Get user details
    const user = await User.findByPk(req.user.id);

    const post = await CommunityPost.create(
      {
        user_id: req.user.id,
        author_name: user.name || 'Utilisateur',
        author_avatar: user.avatar || 'U',
        location,
        image,
        caption,
      },
      { validate: true }
    );

    const createdPost = await CommunityPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
    });

    res.status(201).json(createdPost.toJSON());
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── Toggle like on post ────────────────────────────────────────────────
// POST /api/community/posts/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post introuvable' });
    }

    try {
      // Check if user already likes this post
      const existing = await db.sequelize.query(
        'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
        { replacements: [userId, postId], type: db.Sequelize.QueryTypes.SELECT }
      );

      if (existing.length > 0) {
        // Unlike the post
        await db.sequelize.query(
          'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
          { replacements: [userId, postId] }
        );
        await post.update({ likes_count: Math.max(0, post.likes_count - 1) });
        res.json({ liked: false });
      } else {
        // Like the post
        await db.sequelize.query(
          'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
          { replacements: [userId, postId] }
        );
        await post.update({ likes_count: post.likes_count + 1 });
        res.json({ liked: true });
      }
    } catch (err) {
      // post_likes table might not exist yet
      if (err.message.includes("doesn't exist")) {
        return res.status(503).json({ error: 'Like functionality not available yet' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// ── Get chat messages ──────────────────────────────────────────────────
// GET /api/community/chat
exports.getChat = async (req, res, next) => {
  try {
    // Chat messages are stored in raw table (not Sequelize model)
    const messages = await db.sequelize.query(
      'SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT 100',
      { type: db.Sequelize.QueryTypes.SELECT }
    );
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// ── Send chat message ──────────────────────────────────────────────────
// POST /api/community/chat
exports.sendChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Get user details
    const user = await User.findByPk(req.user.id);

    // Insert chat message using raw query (not yet Sequelize model)
    await db.sequelize.query(
      'INSERT INTO chat_messages (user_id, author_name, author_avatar, message, is_ai) VALUES (?, ?, ?, ?, FALSE)',
      { replacements: [req.user.id, user.name || 'Utilisateur', user.avatar || 'U', message] }
    );

    // Fetch the created message (most recent)
    const [createdMessage] = await db.sequelize.query(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      { replacements: [req.user.id], type: db.Sequelize.QueryTypes.SELECT }
    );

    res.status(201).json(createdMessage);
  } catch (err) {
    next(err);
  }
};
