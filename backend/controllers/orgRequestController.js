const pool = require('../config/db');

// POST /api/org-requests
exports.submit = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, description, document_name, document_data } = req.body;

    // Check for existing pending request
    const [existing] = await pool.query(
      "SELECT id FROM org_requests WHERE user_id = ? AND status = 'pending'",
      [req.user.id]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Vous avez déjà une demande en attente' });

    const [result] = await pool.query(
      `INSERT INTO org_requests (user_id, first_name, last_name, email, phone, description, document_name, document_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, first_name, last_name, email, phone, description, document_name, document_data]
    );

    // Update user role to pending_org
    await pool.query("UPDATE users SET role = 'pending_org' WHERE id = ?", [req.user.id]);

    const [rows] = await pool.query('SELECT * FROM org_requests WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/org-requests/mine
exports.getMine = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM org_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
};

// GET /api/org-requests  (admin)
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM org_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
};

// PATCH /api/org-requests/:id/approve  (admin)
exports.approve = async (req, res, next) => {
  try {
    const [reqRows] = await pool.query('SELECT * FROM org_requests WHERE id = ?', [req.params.id]);
    if (reqRows.length === 0) return res.status(404).json({ error: 'Demande introuvable' });

    await pool.query(
      "UPDATE org_requests SET status = 'approved', reviewed_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    // Upgrade user role to org
    await pool.query("UPDATE users SET role = 'org' WHERE id = ?", [reqRows[0].user_id]);

    res.json({ success: true, message: 'Demande approuvée' });
  } catch (err) { next(err); }
};

// PATCH /api/org-requests/:id/reject  (admin)
exports.reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const [reqRows] = await pool.query('SELECT * FROM org_requests WHERE id = ?', [req.params.id]);
    if (reqRows.length === 0) return res.status(404).json({ error: 'Demande introuvable' });

    await pool.query(
      "UPDATE org_requests SET status = 'rejected', rejection_reason = ?, reviewed_at = NOW() WHERE id = ?",
      [reason, req.params.id]
    );

    // Revert user role
    await pool.query("UPDATE users SET role = 'user' WHERE id = ?", [reqRows[0].user_id]);

    res.json({ success: true, message: 'Demande refusée' });
  } catch (err) { next(err); }
};
