const router = require('express').Router();
const c = require('../controllers/communityController');
const { auth } = require('../middleware/auth');

// Optional auth for posts (to check likes)
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch { /* ignore invalid token */ }
  }
  next();
};

router.get('/posts',          optionalAuth, c.getPosts);
router.post('/posts',         auth, c.createPost);
router.post('/posts/:id/like', auth, c.toggleLike);
router.get('/chat',           c.getChat);
router.post('/chat',          auth, c.sendChat);

module.exports = router;
