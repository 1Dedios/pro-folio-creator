import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.session.user.userId;
  res.json({
    route: '/private', 
    method: req.method, 
    message: `user logged in with id ${userId}`
  });
});

export default router;