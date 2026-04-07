const { Op } = require('sequelize');
const { db } = require('../models/db');
const { Reservation, User, Event } = db;
const { handleSequelizeError } = require('../utils/sequelize');

// ── Get my reservations (user) ──────────────────────────────────────────
// GET /api/reservations
exports.getMine = async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'category', 'location'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reservations.map(r => r.toJSON()));
  } catch (err) {
    next(err);
  }
};

// ── Get all reservations (admin/org) ────────────────────────────────────
// GET /api/reservations/all
exports.getAll = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { ref_code: { [Op.like]: `%${search}%` } },
        { event_title: { [Op.like]: `%${search}%` } },
      ];
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'category', 'location'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reservations.map(r => r.toJSON()));
  } catch (err) {
    next(err);
  }
};

// ── Create reservation ──────────────────────────────────────────────────
// POST /api/reservations
exports.create = async (req, res, next) => {
  try {
    const { event_id, event_title, event_date, event_loc, event_cls, price, option_label, ticket_count, qr_payload } = req.body;

    // Validation
    if (!event_id || !event_title) {
      return res.status(400).json({ error: 'Event ID et titre requis' });
    }

    // Generate unique ref code
    const refCode = `TT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const reservation = await Reservation.create(
      {
        ref_code: refCode,
        user_id: req.user.id,
        event_id,
        event_title,
        event_date,
        event_loc,
        event_cls,
        price,
        option_label: option_label || 'Standard',
        ticket_count: ticket_count || 1,
        status: 'confirmed',
        qr_payload,
      },
      { validate: true }
    );

    const createdReservation = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'category', 'location'],
        },
      ],
    });

    res.status(201).json(createdReservation.toJSON());
  } catch (err) {
    const error = handleSequelizeError(err);
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
};

// ── Verify QR code (org) ────────────────────────────────────────────────
// POST /api/reservations/verify-qr
exports.verifyQR = async (req, res, next) => {
  try {
    const { qr_payload } = req.body;

    if (!qr_payload) {
      return res.status(400).json({ valid: false, reason: 'Payload QR manquant' });
    }

    // Decode payload
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(qr_payload, 'base64').toString('utf-8'));
    } catch {
      return res.json({ valid: false, reason: 'QR code non reconnu ou invalide' });
    }

    // Validate QR code app
    if (decoded.app !== 'TuniTrail') {
      return res.json({ valid: false, reason: 'QR code non reconnu' });
    }

    // Find reservation
    const reservation = await Reservation.findOne({
      where: {
        ref_code: decoded.rid,
        event_id: decoded.eid,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name'],
        },
      ],
    });

    if (!reservation) {
      return res.json({ valid: false, reason: 'Réservation introuvable dans le système' });
    }

    res.json({ valid: true, reservation: reservation.toJSON(), payload: decoded });
  } catch (err) {
    next(err);
  }
};
