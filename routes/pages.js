import express from 'express';
import {portfolios, themes} from "../data/index.js";
import { ObjectId } from 'mongodb';

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
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/users/login');
    }
    res.render('create', { title: 'Create Your Own Portfolio'});
});

router.post('/create', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/users/login');
        }

        const userId = req.session.user.userId;
        const { title, description, contactButtonEnabled } = req.body;

        // Process sections data
        let sections = [];
        if (req.body.sections) {
            // Convert sections from form data format to the expected format
            const sectionsData = Array.isArray(req.body.sections) ? req.body.sections : [req.body.sections];

            for (let section of sectionsData) {
                // Skip sections without type
                if (!section.type) continue;

                // Process items
                let items = [];
                if (section.items) {
                    // Convert items to array if it's not already
                    const itemsData = Array.isArray(section.items) ? section.items : [section.items];

                    for (let item of itemsData) {
                        // Process specific item types
                        if (section.type === 'work' && item.achievements) {
                            try {
                                item.achievements = JSON.parse(item.achievements);
                            } catch (e) {
                                item.achievements = [];
                            }
                        }

                        if (section.type === 'project' && item.technologies) {
                            try {
                                item.technologies = JSON.parse(item.technologies);
                            } catch (e) {
                                item.technologies = [];
                            }
                        }

                        // Convert order to number if it exists
                        if (item.order !== undefined) {
                            item.order = Number(item.order);
                        }

                        items.push(item);
                    }
                }

                // Convert order to number if it exists
                const order = section.order !== undefined ? Number(section.order) : 0;

                sections.push({
                    type: section.type,
                    items: items,
                    order: order
                });
            }
        }

        // Get a default theme
        let themeId;
        try {
            const exampleThemes = await themes.getExampleThemes();
            if (exampleThemes.length > 0) {
                themeId = exampleThemes[0]._id;
            } else {
                // Create a default theme if none exists
                const defaultTheme = await themes.createTheme(
                    null, 
                    "Default Theme", 
                    {
                        primaryColor: "#3B82F6",
                        accentColor: "#1F2937",
                        background: "#F9FAFB",
                        fontFamily: "Inter"
                    },
                    true
                );
                themeId = defaultTheme._id;
            }
        } catch (e) {
            console.error("Error getting theme:", e);
            return res.status(400).render('create', { 
                title: 'Create Your Own Portfolio',
                error: 'Error creating portfolio: Could not get theme',
                formData: req.body,
                formDataJson: JSON.stringify(req.body)
            });
        }

        // Create the portfolio
        const newPortfolio = await portfolios.createPortfolio(
            new ObjectId(userId),
            title,
            description,
            sections,
            { singlePage: true, pages: [] },
            themeId,
            contactButtonEnabled === 'on',
            null
        );

        // Redirect to the new portfolio
        res.redirect(`/portfolio/${newPortfolio._id}`);
    } catch (e) {
        console.error("Error creating portfolio:", e);
        return res.status(400).render('create', { 
            title: 'Create Your Own Portfolio',
            error: 'Error creating portfolio: ' + e,
            formData: req.body,
            formDataJson: JSON.stringify(req.body)
        });
    }
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
