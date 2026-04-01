const router = require('express').Router();
const c = require('../controllers/reviewController');
const { auth, roles } = require('../middleware/auth');

router.get('/event/:id',     c.getByEvent);
router.post('/',             auth, c.create);
router.get('/reported',      auth, roles('admin'), c.getReported);
router.patch('/:id/moderate', auth, roles('admin'), c.moderate);

module.exports = router;
