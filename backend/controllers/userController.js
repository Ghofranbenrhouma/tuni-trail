const { db } = require('../models/db');
const { User } = db;
const { handleSequelizeError } = require('../utils/sequelize');

// ── Get authenticated user profile ──────────────────────────────────────
// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
};

// ── Update authenticated user profile ───────────────────────────────────
// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar, activities } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Update only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (activities !== undefined) updateData.activities = activities;

    await user.update(updateData, { validate: true });

    res.json(user.toJSON());
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── List all users (admin) ──────────────────────────────────────────────
// GET /api/users
exports.getAll = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'phone', 'avatar', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users.map(u => u.toJSON()));
  } catch (err) {
    next(err);
  }
};

// ── Get user by ID (admin) ───────────────────────────────────────────────
// GET /api/users/:id
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
};
