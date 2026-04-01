const router = require('express').Router();
const c = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

router.get('/',  auth, c.get);
router.post('/', auth, c.toggle);

module.exports = router;
