const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    // Check existing
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);
    const avatar = (name || 'A').slice(0, 2).toUpperCase();
    const userRole = role || 'user';

    const [result] = await pool.query(
      'INSERT INTO users (email, password, name, avatar, role) VALUES (?, ?, ?, ?, ?)',
      [email, hash, name || 'Aventurier', avatar, userRole]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, email, name: name || 'Aventurier', avatar, role: userRole },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Demo login (no credentials)
    if (!email && !password && role) {
      const demoEmail = role === 'org' ? 'org@demo.com' : 'user@demo.com';
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [demoEmail]);
      if (rows.length === 0) return res.status(404).json({ error: 'Compte démo introuvable' });

      const u = rows[0];
      const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...safe } = u;
      return res.json({ success: true, token, user: safe });
    }

    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safe } = user;
    res.json({ success: true, token, user: safe });
  } catch (err) { next(err); }
};
