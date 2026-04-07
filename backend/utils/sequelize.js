// ── Sequelize Utilities ─────────────────────────────────────────────────
// Common helpers for pagination, filtering, error handling

const { Op } = require('sequelize');

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Query object { page, limit }
 * @returns {Object} { limit, offset }
 */
function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Format paginated response
 * @param {Array} rows - Array of results
 * @param {Number} total - Total count
 * @param {Object} pagination - { page, limit }
 * @returns {Object} Formatted response with pagination metadata
 */
function formatPaginatedResponse(rows, total, { page, limit }) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Build search filter for multiple fields
 * @param {String} searchTerm - Search string
 * @param {Array} fields - Field names to search
 * @returns {Object} Sequelize where clause
 */
function buildSearchFilter(searchTerm, fields = []) {
  if (!searchTerm || fields.length === 0) return {};

  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.like]: `%${searchTerm}%` },
    })),
  };
}

/**
 * Convert Sequelize validation error to readable format
 * @param {Array} errors - Sequelize validation errors
 * @returns {Object} Formatted errors { field: 'message' }
 */
function formatValidationErrors(errors) {
  const formatted = {};
  errors.forEach((err) => {
    formatted[err.path] = err.message;
  });
  return formatted;
}

/**
 * Sequelize error handler middleware
 * Converts Sequelize errors to HTTP responses
 * @param {Error} err - Error object
 * @returns {Object} { statusCode, message, details }
 */
function handleSequelizeError(err) {
  const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

  if (err instanceof ValidationError) {
    return {
      statusCode: 400,
      message: 'Validation error',
      details: formatValidationErrors(err.errors),
    };
  }

  if (err instanceof UniqueConstraintError) {
    return {
      statusCode: 409,
      message: `${err.errors[0].path} already exists`,
      details: err.errors[0],
    };
  }

  if (err instanceof ForeignKeyConstraintError) {
    return {
      statusCode: 400,
      message: 'Invalid reference: related record not found',
      details: { constraint: err.constraint },
    };
  }

  return {
    statusCode: 500,
    message: err.message || 'Database error',
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
  buildSearchFilter,
  formatValidationErrors,
  handleSequelizeError,
};
