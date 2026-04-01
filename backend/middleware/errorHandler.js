/**
 * Global error handler — catches unhandled errors from async routes.
 */
function errorHandler(err, req, res, next) {
  console.error('⚠️  Error:', err.message || err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Entrée dupliquée — cet enregistrement existe déjà.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
