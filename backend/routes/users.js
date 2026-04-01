const router = require('express').Router();
const c = require('../controllers/userController');
const { auth, roles } = require('../middleware/auth');

router.get('/me', auth, c.getMe);
router.put('/me', auth, c.updateMe);
router.get('/',   auth, roles('admin'), c.getAll);
router.get('/:id', auth, roles('admin'), c.getById);

module.exports = router;
