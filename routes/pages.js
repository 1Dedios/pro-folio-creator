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
                    _id: new ObjectId(),
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

        // Process layout data
        let layout = { singlePage: true, pages: [] };
        if (req.body.multiPageLayout === 'on' && req.body.pageNames) {
            const pageNames = Array.isArray(req.body.pageNames) ? req.body.pageNames : [req.body.pageNames];

            // Create pages array with titles
            const pages = pageNames.map(title => ({
                title,
                sectionIds: []
            }));

            // Process section page assignments
            if (req.body.layout && req.body.layout.pages) {
                const layoutPages = req.body.layout.pages;

                // Process each page's sectionIds
                for (let i = 0; i < pages.length; i++) {
                    if (layoutPages[i] && layoutPages[i].sectionIds) {
                        // Convert sectionIds to ObjectId
                        const sectionIds = Array.isArray(layoutPages[i].sectionIds) 
                            ? layoutPages[i].sectionIds 
                            : [layoutPages[i].sectionIds];

                        // Process section IDs - handle both ObjectIds and temporary IDs
                        pages[i].sectionIds = sectionIds
                            .map(id => {
                                // Check if it's a temporary ID in the format "section-X"
                                const tempIdMatch = id && typeof id === 'string' ? id.match(/^section-(\d+)$/) : null;

                                if (tempIdMatch) {
                                    // It's a temporary ID, get the section index
                                    const sectionIndex = parseInt(tempIdMatch[1]);
                                    // Return the corresponding section's _id if it exists
                                    return sectionIndex < sections.length ? sections[sectionIndex]._id : null;
                                } else if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
                                    // It's a valid ObjectId string
                                    return new ObjectId(id);
                                }
                                return null;
                            })
                            .filter(id => id !== null); // Remove any null values
                    }
                }
            }

            layout = {
                singlePage: false,
                pages: pages
            };
        }

        // Create the portfolio
        const newPortfolio = await portfolios.createPortfolio(
            new ObjectId(userId),
            title,
            description,
            sections,
            layout,
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
        const pageIndex = req.query.page ? parseInt(req.query.page) : 0;

        // Get the theme for the portfolio
        // Note: We're ignoring themes for now as specified in the requirements
        // const theme = await themes.getThemeById(portfolio.themeId);

        // Handle multi-page layout
        let currentPageIndex = 0;
        let filteredSections = portfolio.sections;

        if (!portfolio.layout.singlePage && portfolio.layout.pages && portfolio.layout.pages.length > 0) {
            // Validate page index
            currentPageIndex = Math.min(Math.max(0, pageIndex), portfolio.layout.pages.length - 1);

            // Filter sections for the current page
            if (currentPageIndex < portfolio.layout.pages.length) {
                const currentPage = portfolio.layout.pages[currentPageIndex];
                if (currentPage && currentPage.sectionIds) {
                    // Convert sectionIds to strings for comparison
                    const pageSectionIds = currentPage.sectionIds.map(id => id.toString());

                    // Filter sections that belong to this page
                    filteredSections = portfolio.sections.filter(section => 
                        pageSectionIds.includes(section._id.toString())
                    );
                }
            }
        }

        res.render('portfolio', {
            title: portfolio.title,
            portfolio: portfolio,
            currentUser: req.session.user,
            currentPageIndex: currentPageIndex,
            filteredSections: filteredSections
        });
    } catch (e) {
        res.status(404).json({ error: 'Not found' });
    }
});

router.get('/portfolio/:id/edit', async (req, res) => {
    try {
        console.log('[DEBUG_LOG] Edit portfolio route accessed for ID:', req.params.id);

        // Check if user is logged in
        if (!req.session.user) {
            console.log('[DEBUG_LOG] User not logged in, redirecting to login');
            return res.redirect('/users/login');
        }

        console.log('[DEBUG_LOG] Fetching portfolio from database...');
        const portfolio = await portfolios.getPortfolioById(req.params.id);
        console.log('[DEBUG_LOG] Portfolio retrieved from DB:', JSON.stringify(portfolio, null, 2));

        // Log sections and items specifically
        if (portfolio.sections) {
            console.log('[DEBUG_LOG] Number of sections:', portfolio.sections.length);
            portfolio.sections.forEach((section, i) => {
                console.log(`[DEBUG_LOG] Section ${i} (${section.type}):`, JSON.stringify(section, null, 2));
                if (section.items) {
                    console.log(`[DEBUG_LOG] Section ${i} has ${section.items.length} items`);
                    section.items.forEach((item, j) => {
                        console.log(`[DEBUG_LOG] Section ${i}, Item ${j}:`, JSON.stringify(item, null, 2));
                    });
                }
            });
        }

        // Check if the logged-in user is the owner of the portfolio
        if (portfolio.ownerId.toString() !== req.session.user.userId) {
            console.log('[DEBUG_LOG] User is not the owner of this portfolio');
            return res.status(403).render('error', { 
                title: 'Access Denied',
                error: 'You do not have permission to edit this portfolio'
            });
        }

        console.log('[DEBUG_LOG] Rendering create page with portfolio data');
        // Render the create page with the portfolio data
        res.render('create', { 
            title: 'Edit Portfolio',
            portfolio: portfolio,
            portfolioJson: JSON.stringify(portfolio)
        });
    } catch (e) {
        console.error('[DEBUG_LOG] Error in edit portfolio route:', e);
        res.status(404).render('error', { 
            title: 'Not Found',
            error: 'Portfolio not found'
        });
    }
});

router.post('/portfolio/:id/edit', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/users/login');
        }

        const portfolioId = req.params.id;
        const existingPortfolio = await portfolios.getPortfolioById(portfolioId);

        // Check if the logged-in user is the owner of the portfolio
        if (existingPortfolio.ownerId.toString() !== req.session.user.userId) {
            return res.status(403).render('error', { 
                title: 'Access Denied',
                error: 'You do not have permission to edit this portfolio'
            });
        }

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
                    _id: new ObjectId(),
                    type: section.type,
                    items: items,
                    order: order
                });
            }
        }

        // Process layout data
        let layout = { singlePage: true, pages: [] };
        if (req.body.multiPageLayout === 'on' && req.body.pageNames) {
            const pageNames = Array.isArray(req.body.pageNames) ? req.body.pageNames : [req.body.pageNames];

            // Create pages array with titles
            const pages = pageNames.map(title => ({
                title,
                sectionIds: []
            }));

            // Process section page assignments
            if (req.body.layout && req.body.layout.pages) {
                const layoutPages = req.body.layout.pages;

                // Process each page's sectionIds
                for (let i = 0; i < pages.length; i++) {
                    if (layoutPages[i] && layoutPages[i].sectionIds) {
                        // Convert sectionIds to ObjectId
                        const sectionIds = Array.isArray(layoutPages[i].sectionIds) 
                            ? layoutPages[i].sectionIds 
                            : [layoutPages[i].sectionIds];

                        // Process section IDs - handle both ObjectIds and temporary IDs
                        pages[i].sectionIds = sectionIds
                            .map(id => {
                                // Check if it's a temporary ID in the format "section-X"
                                const tempIdMatch = id && typeof id === 'string' ? id.match(/^section-(\d+)$/) : null;

                                if (tempIdMatch) {
                                    // It's a temporary ID, get the section index
                                    const sectionIndex = parseInt(tempIdMatch[1]);
                                    // Return the corresponding section's _id if it exists
                                    return sectionIndex < sections.length ? sections[sectionIndex]._id : null;
                                } else if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
                                    // It's a valid ObjectId string
                                    return new ObjectId(id);
                                }
                                return null;
                            })
                            .filter(id => id !== null); // Remove any null values
                    }
                }
            }

            layout = {
                singlePage: false,
                pages: pages
            };
        }

        // Update the portfolio
        const updatedPortfolio = await portfolios.updatePortfolio(
            new ObjectId(portfolioId),
            title,
            description,
            sections,
            layout,
            existingPortfolio.themeId, // Keep the existing theme
            contactButtonEnabled === 'on',
            existingPortfolio.contactEmail // Keep the existing contact email
        );

        // Redirect to the updated portfolio
        res.redirect(`/portfolio/${updatedPortfolio._id}`);
    } catch (e) {
        console.error("Error updating portfolio:", e);

        // Try to get the portfolio to re-render the form with errors
        let portfolio;
        try {
            portfolio = await portfolios.getPortfolioById(req.params.id);
        } catch (err) {
            // If we can't get the portfolio, just show a generic error
            return res.status(400).render('error', { 
                title: 'Error',
                error: 'Error updating portfolio: ' + e
            });
        }

        return res.status(400).render('create', { 
            title: 'Edit Portfolio',
            error: 'Error updating portfolio: ' + e,
            portfolio: portfolio,
            portfolioJson: JSON.stringify(portfolio),
            formData: req.body,
            formDataJson: JSON.stringify(req.body)
        });
    }
});

router.post('/portfolio/:id/copy', async (req, res) => {
    try {
        const initial = await portfolios.getPortfolioById(req.params.id);      //find original portfolio by ID

        if (!req.session.user) {                                                //ensure user is logged in
            return res.status(401).send("Must be logged in to copy a portfolio.");
        }
        await portfolios.createPortfolio(
            new ObjectId(req.session.user.userId),
            initial.title + ' - Copy',
            initial.description,
            initial.sections,
            initial.layout || { singlePage: true, pages: [] },
            initial.themeId,
            initial.contactButtonEnabled,
            null,
            false,
            initial._id
        );
        res.redirect('/users/profile');
    } catch (e) {
        console.error(e);
        res.status(500).send("Error copying portfolio");
    }
});

export default router;
