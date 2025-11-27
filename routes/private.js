import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({route: '/private', method: req.method, message: 'user logged in'});
});

export default router;