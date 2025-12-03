import express from 'express';
import {portfolios} from "../data/index.js";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const examples = await portfolios.getExamplePortfolios();
        
        res.render('home', { title: 'ProFolio', examples: examples });
    } catch (e) {
        res.status(500).json({ error: 'Could not load portfolios'});
    }
});

router.get('/create', (req, res) => {                          
    res.render('create', { title: 'Create Your Own Portfolio'});
});

router.get('/portfolio/:id', async (req, res) => {
    try {
        const portfolio = await portfolios.getPortfolioById(req.params.id);

        // Get the theme for the portfolio
        // Note: We're ignoring themes for now as specified in the requirements
        // const theme = await themes.getThemeById(portfolio.themeId);

        res.render('portfolio', {
            title: portfolio.title,
            portfolio: portfolio
        });
    } catch (e) {
        res.status(404).json({ error: 'Not found' });
    }
});

export default router;