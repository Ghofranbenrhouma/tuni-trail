const router = require('express').Router();
const c = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.get('/',       auth, c.get);
router.post('/',      auth, c.add);
router.put('/:id',    auth, c.updateQty);
router.delete('/:id', auth, c.remove);
router.delete('/',    auth, c.clear);

module.exports = router;
