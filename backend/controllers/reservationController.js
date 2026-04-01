const pool = require('../config/db');

// GET /api/reservations  (user — my reservations)
exports.getMine = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/reservations/all  (admin/org)
exports.getAll = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT r.*, u.name AS user_name, u.email AS user_email FROM reservations r LEFT JOIN users u ON r.user_id = u.id WHERE 1=1';
    const params = [];

    if (status && status !== 'all') { sql += ' AND r.status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (r.ref_code LIKE ? OR r.event_title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/reservations
exports.create = async (req, res, next) => {
  try {
    const { event_id, event_title, event_date, event_loc, event_cls, price, option_label, ticket_count, qr_payload } = req.body;

    const refCode = 'TT-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    const [result] = await pool.query(
      `INSERT INTO reservations (ref_code, user_id, event_id, event_title, event_date, event_loc, event_cls, price, option_label, ticket_count, status, qr_payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [refCode, req.user.id, event_id, event_title, event_date, event_loc, event_cls, price, option_label || 'Standard', ticket_count || 1, qr_payload]
    );

    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/reservations/verify-qr  (org)
exports.verifyQR = async (req, res, next) => {
  try {
    const { qr_payload } = req.body;
    if (!qr_payload) return res.status(400).json({ valid: false, reason: 'Payload QR manquant' });

    // Decode payload
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(qr_payload, 'base64').toString('utf-8'));
    } catch {
      return res.json({ valid: false, reason: 'QR code non reconnu ou invalide' });
    }

    if (decoded.app !== 'TuniTrail') {
      return res.json({ valid: false, reason: 'QR code non reconnu' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM reservations WHERE ref_code = ? AND event_id = ?',
      [decoded.rid, decoded.eid]
    );

    if (rows.length === 0) {
      return res.json({ valid: false, reason: 'Réservation introuvable dans le système' });
    }

    res.json({ valid: true, reservation: rows[0], payload: decoded });
  } catch (err) { next(err); }
};
