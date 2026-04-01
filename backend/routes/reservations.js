const router = require('express').Router();
const c = require('../controllers/reservationController');
const { auth, roles } = require('../middleware/auth');

router.get('/',      auth, c.getMine);
router.get('/all',   auth, roles('admin', 'org'), c.getAll);
router.post('/',     auth, c.create);
router.post('/verify-qr', auth, roles('org', 'admin'), c.verifyQR);

module.exports = router;
