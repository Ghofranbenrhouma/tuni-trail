const router = require('express').Router();
const c = require('../controllers/eventController');
const { auth, roles } = require('../middleware/auth');

router.get('/',    c.getAll);
router.get('/:id', c.getById);
router.post('/',   auth, roles('org', 'admin'), c.create);
router.put('/:id', auth, roles('org', 'admin'), c.update);
router.delete('/:id', auth, roles('admin'), c.remove);
router.patch('/:id/status',   auth, roles('admin'), c.changeStatus);
router.patch('/:id/featured', auth, roles('admin'), c.toggleFeatured);

module.exports = router;
