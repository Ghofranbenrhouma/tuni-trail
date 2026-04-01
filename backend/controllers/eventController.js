const pool = require('../config/db');

// GET /api/events
exports.getAll = async (req, res, next) => {
  try {
    const { category, location, difficulty, status } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category)   { sql += ' AND category = ?';   params.push(category); }
    if (location)   { sql += ' AND location = ?';   params.push(location); }
    if (difficulty)  { sql += ' AND difficulty = ?'; params.push(difficulty); }
    if (status)     { sql += ' AND status = ?';     params.push(status); }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/events/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Événement introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/events  (org)
exports.create = async (req, res, next) => {
  try {
    const { title, category, location, date, duration, price, price_num, difficulty, css_class, description, includes, excludes, program, lat, lng, map_label, images, max_people, min_age, options, status, capacity } = req.body;

    const [result] = await pool.query(
      `INSERT INTO events (title, category, location, date, duration, price, price_num, difficulty, css_class, organizer_id, organizer, description, includes, excludes, program, lat, lng, map_label, images, max_people, min_age, options, status, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, location, date, duration, price, price_num || 0, difficulty || 'Facile', css_class,
       req.user.id, req.user.name || 'Organisateur', description,
       JSON.stringify(includes), JSON.stringify(excludes), JSON.stringify(program),
       lat, lng, map_label, JSON.stringify(images), max_people, min_age,
       JSON.stringify(options), status || 'draft', capacity || 0]
    );

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/events/:id  (org/admin)
exports.update = async (req, res, next) => {
  try {
    const fields = req.body;
    const sets = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (['includes', 'excludes', 'program', 'images', 'options'].includes(key)) {
        sets.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (sets.length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });

    params.push(req.params.id);
    await pool.query(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/events/:id  (admin)
exports.remove = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Événement supprimé' });
  } catch (err) { next(err); }
};

// PATCH /api/events/:id/status  (admin)
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['published', 'draft', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    await pool.query('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, status });
  } catch (err) { next(err); }
};

// PATCH /api/events/:id/featured  (admin)
exports.toggleFeatured = async (req, res, next) => {
  try {
    await pool.query('UPDATE events SET is_featured = NOT is_featured WHERE id = ?', [req.params.id]);
    const [rows] = await pool.query('SELECT is_featured FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, is_featured: rows[0]?.is_featured });
  } catch (err) { next(err); }
};
