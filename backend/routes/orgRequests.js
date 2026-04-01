const router = require('express').Router();
const c = require('../controllers/orgRequestController');
const { auth, roles } = require('../middleware/auth');

router.post('/',              auth, c.submit);
router.get('/mine',           auth, c.getMine);
router.get('/',               auth, roles('admin'), c.getAll);
router.patch('/:id/approve',  auth, roles('admin'), c.approve);
router.patch('/:id/reject',   auth, roles('admin'), c.reject);

module.exports = router;
