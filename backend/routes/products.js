const router = require('express').Router();
const c = require('../controllers/productController');

router.get('/',           c.getAll);
router.get('/categories', c.getCategories);
router.get('/:id',        c.getById);

module.exports = router;
