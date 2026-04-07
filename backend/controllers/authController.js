const jwt = require('jsonwebtoken');
const { db } = require('../models/db');
const { User } = db;
const { handleSequelizeError } = require('../utils/sequelize');

// ── Register ────────────────────────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Create user (Sequelize will handle unique constraint)
    const user = await User.create(
      {
        email,
        password,
        name: name || 'Aventurier',
        avatar: (name || 'A').slice(0, 2).toUpperCase(),
        role: role || 'user',
      },
      { validate: true } // Run validations
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    // Handle Sequelize errors
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── Login ────────────────────────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Demo login (no credentials)
    if (!email && !password && role) {
      const demoEmail = role === 'org' ? 'org@demo.com' : 'user@demo.com';
      const user = await User.findOne({ where: { email: demoEmail } });

      if (!user) {
        return res.status(404).json({ error: 'Compte démo introuvable' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: user.toJSON(),
      });
    }

    // Standard login
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const passwordMatch = await user.validatePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};
