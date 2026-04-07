const router = require('express').Router();
const c = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.get('/',  auth, c.getMine);
router.get('/:id', auth, c.getById);
router.post('/', auth, c.create);

module.exports = router;
