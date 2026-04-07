const { Op } = require('sequelize');
const { db } = require('../models/db');
const { Event, User } = db;
const { handleSequelizeError, buildSearchFilter } = require('../utils/sequelize');

// ── Get all events with filtering ───────────────────────────────────────
// GET /api/events
exports.getAll = async (req, res, next) => {
  try {
    const { category, location, difficulty, status } = req.query;

    // Build where clause
    const where = {};
    if (category) where.category = category;
    if (location) where.location = location;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;

    const events = await Event.findAll({
      where,
      include: [
        {
          model: User,
          as: 'organizer_details',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(events.map(e => e.toJSON ? e.toJSON() : e));
  } catch (err) {
    next(err);
  }
};

// ── Get event by ID ─────────────────────────────────────────────────────
// GET /api/events/:id
exports.getById = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'organizer_details',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    res.json(event.toJSON());
  } catch (err) {
    next(err);
  }
};

// ── Create event (org) ──────────────────────────────────────────────────
// POST /api/events
exports.create = async (req, res, next) => {
  try {
    const {
      title,
      category,
      location,
      date,
      duration,
      price,
      price_num,
      difficulty,
      css_class,
      description,
      includes,
      excludes,
      program,
      lat,
      lng,
      map_label,
      images,
      max_people,
      min_age,
      options,
      status,
      capacity,
    } = req.body;

    // Validation
    if (!title || !category) {
      return res.status(400).json({ error: 'Titre et catégorie requis' });
    }

    const event = await Event.create(
      {
        title,
        category,
        location,
        date,
        duration,
        price,
        price_num: price_num || 0,
        difficulty: difficulty || 'Facile',
        css_class,
        organizer_id: req.user.id,
        organizer: req.user.name || 'Organisateur',
        description,
        includes: includes || [],
        excludes: excludes || [],
        program: program || [],
        lat,
        lng,
        map_label,
        images: images || [],
        max_people,
        min_age,
        options: options || [],
        status: status || 'draft',
        capacity: capacity || 0,
      },
      { validate: true }
    );

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'organizer_details',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
    });

    res.status(201).json(createdEvent.toJSON());
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── Update event (org/admin) ────────────────────────────────────────────
// PUT /api/events/:id
exports.update = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Ensure JSON fields are properly handled
    ['includes', 'excludes', 'program', 'images', 'options'].forEach((jsonField) => {
      if (updateData[jsonField] !== undefined) {
        // Sequelize will handle JSON serialization automatically
        updateData[jsonField] = updateData[jsonField];
      }
    });

    await event.update(updateData, { validate: true });

    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'organizer_details',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
    });

    res.json(updatedEvent.toJSON());
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── Delete event (admin) ────────────────────────────────────────────────
// DELETE /api/events/:id
exports.remove = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    await event.destroy();

    res.json({ success: true, message: 'Événement supprimé' });
  } catch (err) {
    next(err);
  }
};

// ── Change event status (admin) ─────────────────────────────────────────
// PATCH /api/events/:id/status
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!['published', 'draft', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide. Doit être: published, draft, ou suspended' });
    }

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    await event.update({ status });

    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};

// ── Toggle featured status (admin) ──────────────────────────────────────
// PATCH /api/events/:id/featured
exports.toggleFeatured = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    // Toggle the is_featured field
    await event.update({ is_featured: !event.is_featured });

    res.json({ success: true, is_featured: event.is_featured });
  } catch (err) {
    next(err);
  }
};
