import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Profolio'});
});

router.get('/create', (req, res) => {                          
    res.render('create', { title: 'Create Your Own Portfolio'});
});

export default router;