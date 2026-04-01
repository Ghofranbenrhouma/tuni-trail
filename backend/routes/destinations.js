const router = require('express').Router();
const c = require('../controllers/destinationController');

router.get('/',    c.getAll);
router.get('/:id', c.getById);

module.exports = router;
