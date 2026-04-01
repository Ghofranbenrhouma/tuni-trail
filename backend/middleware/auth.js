const jwt = require('jsonwebtoken');

/**
 * Middleware: verify JWT token from Authorization header.
 * Sets req.user = { id, email, role }
 */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé — token manquant' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

/**
 * Middleware: restrict to specific roles.
 * Usage: router.get('/admin-only', auth, roles('admin'), handler)
 */
function roles(...allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit — rôle insuffisant' });
    }
    next();
  };
}

module.exports = { auth, roles };
