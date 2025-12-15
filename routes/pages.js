import express from 'express';
import {portfolios, themes, users} from "../data/index.js";
import { ObjectId } from 'mongodb';
import { users as usersCollection } from '../config/mongoCollections.js';

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
                                // If JSON parsing fails, try treating it as a comma-separated string
                                if (typeof item.technologies === 'string') {
                                    item.technologies = item.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
                                } else {
                                    item.technologies = [];
                                }
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

        // Get the selected theme or use a default theme
        let themeId;
        try {
            if (req.body.themeId) {
                // Use the selected theme
                themeId = req.body.themeId;

                // Verify the theme exists
                await themes.getThemeById(themeId);
            } else {
                // No theme selected, use a default theme
                const exampleThemes = await themes.getExampleThemes();
                if (exampleThemes.length > 0) {
                    themeId = exampleThemes[0]._id;
                } else {
                    // Create a default theme if none exists
                    const defaultTheme = await themes.createTheme(
                        null, 
                        "Default Theme", 
                        {
                            backgroundColor: "#F9FAFB",
                            sectionColor: "#FFFFFF",
                            textColor: "#3B82F6"
                        },
                        true
                    );
                    themeId = defaultTheme._id;
                }
            }
        } catch (e) {
            // console.error("Error getting theme:", e);
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
            false
        );

        // Redirect to the new portfolio
        res.redirect(`/portfolio/${newPortfolio._id}`);
    } catch (e) {
        // console.error("Error creating portfolio:", e);
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

        // Check access permissions
        // Allow if it's an example portfolio OR if the user is logged in and owns the portfolio
        if (!portfolio.isExample && 
            (!req.session.user || req.session.user.userId !== portfolio.ownerId.toString())) {
            return res.status(403).render('error', { 
                title: 'Access Denied',
                error: 'You do not have permission to view this portfolio'
            });
        }

        // Get the theme for the portfolio
        let theme = null;
        try {
            theme = await themes.getThemeById(portfolio.themeId);
        } catch (e) {
            console.error("Error getting theme:", e);
            // If theme not found, continue without it
        }

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
            filteredSections: filteredSections,
            theme: theme
        });
    } catch (e) {
        res.status(404).json({ error: 'Not found' });
    }
});

router.get('/portfolio/:id/edit', async (req, res) => {
    try {
        // console.log('[DEBUG_LOG] Edit portfolio route accessed for ID:', req.params.id);

        // Check if user is logged in
        if (!req.session.user) {
            // console.log('[DEBUG_LOG] User not logged in, redirecting to login');
            return res.redirect('/users/login');
        }

        // console.log('[DEBUG_LOG] Fetching portfolio from database...');
        const portfolio = await portfolios.getPortfolioById(req.params.id);
        // console.log('[DEBUG_LOG] Portfolio retrieved from DB:', JSON.stringify(portfolio, null, 2));

        // Log sections and items specifically
        if (portfolio.sections) {
            // console.log('[DEBUG_LOG] Number of sections:', portfolio.sections.length);
            portfolio.sections.forEach((section, i) => {
                // console.log(`[DEBUG_LOG] Section ${i} (${section.type}):`, JSON.stringify(section, null, 2));
                if (section.items) {
                    // console.log(`[DEBUG_LOG] Section ${i} has ${section.items.length} items`);
                    section.items.forEach((item, j) => {
                        // console.log(`[DEBUG_LOG] Section ${i}, Item ${j}:`, JSON.stringify(item, null, 2));
                    });
                }
            });
        }

        // Check if the logged-in user is the owner of the portfolio
        if (portfolio.ownerId.toString() !== req.session.user.userId) {
            // console.log('[DEBUG_LOG] User is not the owner of this portfolio');
            return res.status(403).render('error', { 
                title: 'Access Denied',
                error: 'You do not have permission to edit this portfolio'
            });
        }

        // console.log('[DEBUG_LOG] Rendering create page with portfolio data');
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
                                // If JSON parsing fails, try treating it as a comma-separated string
                                if (typeof item.technologies === 'string') {
                                    item.technologies = item.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
                                } else {
                                    item.technologies = [];
                                }
                            }
                        }

                        // Convert order to number if it exists
                        if (item.order !== undefined) {
                            item.order = Number(item.order);
                        }

                        // Check if this item has an ID (for edit operations)
                        if (item._id) {
                            // Use the existing ID if available
                            item._id = new ObjectId(item._id);
                        } else {
                            // Create a new ID for new items
                            item._id = new ObjectId();
                        }

                        items.push(item);
                    }
                }

                // Convert order to number if it exists
                const order = section.order !== undefined ? Number(section.order) : 0;

                // Check if this section has an ID (for edit operations)
                let sectionId;
                if (section._id) {
                    // Use the existing ID if available
                    sectionId = new ObjectId(section._id);
                } else {
                    // Create a new ID for new sections
                    sectionId = new ObjectId();
                }

                sections.push({
                    _id: sectionId,
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

        // Update the portfolio with the selected theme or keep the existing one
        const themeId = req.body.themeId || existingPortfolio.themeId;

        // Update the portfolio
        const updatedPortfolio = await portfolios.updatePortfolio(
            new ObjectId(portfolioId),
            title,
            description,
            sections,
            layout,
            themeId,
            contactButtonEnabled === 'on'
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
        // console.log("[DEBUG_LOG] Starting portfolio copy process");
        const initial = await portfolios.getPortfolioById(req.params.id);      //find original portfolio by ID
        // console.log(`[DEBUG_LOG] Original portfolio: ID=${initial._id}, Title=${initial.title}`);
        // console.log(`[DEBUG_LOG] Original portfolio has ${initial.sections ? initial.sections.length : 0} sections`);
        // console.log(`[DEBUG_LOG] Original layout: singlePage=${initial.layout ? initial.layout.singlePage : 'undefined'}`);

        if (initial.layout && !initial.layout.singlePage && initial.layout.pages) {
            // console.log(`[DEBUG_LOG] Original layout has ${initial.layout.pages.length} pages`);
            initial.layout.pages.forEach((page, i) => {
                // console.log(`[DEBUG_LOG] Original page ${i}: title=${page.title}, sectionIds=${page.sectionIds ? page.sectionIds.map(id => id.toString()).join(', ') : 'none'}`);
            });
        }

        if (!req.session.user) {                                                //ensure user is logged in
            return res.status(401).send("Must be logged in to copy a portfolio.");
        }

        // Create deep copies of sections with new IDs
        const sectionIdMap = new Map(); // Map old section IDs to new section IDs
        const newSections = initial.sections.map(section => {
            const oldId = section._id.toString();
            // Deep copy the section
            const sectionCopy = JSON.parse(JSON.stringify(section));
            // Create a new section with a new ID
            const newId = new ObjectId();
            const newSection = { ...sectionCopy, _id: newId };

            // Ensure any nested _id properties are also converted to ObjectId
            if (newSection.items && Array.isArray(newSection.items)) {
                newSection.items = newSection.items.map(item => {
                    if (item && item._id) {
                        return { ...item, _id: new ObjectId() };
                    }
                    return item;
                });
            }
            sectionIdMap.set(oldId, newId);
            // console.log(`[DEBUG_LOG] Mapping section ID: ${oldId} -> ${newId}`);
            return newSection;
        });

        // Create a deep copy of the layout and update section IDs
        let newLayout = initial.layout ? JSON.parse(JSON.stringify(initial.layout)) : { singlePage: true, pages: [] };
        // console.log(`[DEBUG_LOG] New layout: singlePage=${newLayout ? newLayout.singlePage : 'undefined'}`);

        // If it's a multi-page layout, update the section IDs in each page
        if (newLayout && !newLayout.singlePage && newLayout.pages && newLayout.pages.length > 0) {
            // console.log(`[DEBUG_LOG] Updating section IDs in multi-page layout`);
            // console.log(`[DEBUG_LOG] Layout has ${newLayout.pages.length} pages`);

            // Ensure layout.pages is an array
            if (!Array.isArray(newLayout.pages)) {
                console.error(`[DEBUG_LOG] ERROR: newLayout.pages is not an array:`, newLayout.pages);
                newLayout.pages = [];
            }

            newLayout.pages = newLayout.pages.map((page, pageIndex) => {
                if (!page) {
                    console.error(`[DEBUG_LOG] ERROR: Page ${pageIndex} is null or undefined`);
                    return { title: `Page ${pageIndex + 1}`, sectionIds: [] };
                }

                // console.log(`[DEBUG_LOG] Processing page ${pageIndex}: ${page.title}`);

                // Ensure page has a title
                if (!page.title) {
                    console.warn(`[DEBUG_LOG] WARNING: Page ${pageIndex} has no title, setting default title`);
                    page.title = `Page ${pageIndex + 1}`;
                }

                // Ensure page.sectionIds is an array
                if (!page.sectionIds) {
                    console.warn(`[DEBUG_LOG] WARNING: Page ${pageIndex} has no sectionIds, creating empty array`);
                    page.sectionIds = [];
                }

                if (!Array.isArray(page.sectionIds)) {
                    console.error(`[DEBUG_LOG] ERROR: Page ${pageIndex} sectionIds is not an array:`, page.sectionIds);
                    page.sectionIds = [];
                }

                if (page.sectionIds && page.sectionIds.length > 0) {
                    // console.log(`[DEBUG_LOG] Page ${pageIndex} has ${page.sectionIds.length} section IDs before update`);

                    // Update section IDs using the mapping
                    const newSectionIds = page.sectionIds.map(oldId => {
                        if (!oldId) {
                            console.error(`[DEBUG_LOG] ERROR: oldId is null or undefined`);
                            return null;
                        }

                        const oldIdStr = oldId.toString();
                        if (sectionIdMap.has(oldIdStr)) {
                            const newId = sectionIdMap.get(oldIdStr);
                            // console.log(`[DEBUG_LOG] Updating page ${pageIndex} section ID: ${oldIdStr} -> ${newId}`);
                            return newId;
                        } else {
                            console.error(`[DEBUG_LOG] ERROR: Could not find mapping for section ID: ${oldIdStr}`);
                            // Try to find the section in the new sections array by comparing properties
                            const originalSection = initial.sections.find(s => s._id.toString() === oldIdStr);
                            if (originalSection) {
                                const matchingNewSection = newSections.find(s => 
                                    s.type === originalSection.type && 
                                    JSON.stringify(s.items) === JSON.stringify(originalSection.items)
                                );
                                if (matchingNewSection) {
                                    // console.log(`[DEBUG_LOG] Found matching section by properties: ${matchingNewSection._id}`);
                                    return matchingNewSection._id;
                                }
                            }
                            // If we can't find a match, return null instead of the original ID
                            // console.log(`[DEBUG_LOG] No matching section found, returning null`);
                            return null;
                        }
                    }).filter(id => id !== null); // Remove any null values

                    // console.log(`[DEBUG_LOG] Page ${pageIndex} has ${newSectionIds.length} section IDs after update`);
                    return { ...page, sectionIds: newSectionIds };
                } else {
                    // If the page has no sectionIds, assign all sections to this page
                    // This ensures that even if sectionIds are empty, the page will still have sections
                    // console.log(`[DEBUG_LOG] Page ${pageIndex} has no sectionIds, assigning all sections to this page`);
                    const allNewSectionIds = newSections.map(section => section._id);
                    // console.log(`[DEBUG_LOG] Assigned ${allNewSectionIds.length} sections to page ${pageIndex}`);
                    return { ...page, sectionIds: allNewSectionIds };
                }
            });
        } else {
            // console.log(`[DEBUG_LOG] Not a multi-page layout or no pages found`);
            // console.log(`[DEBUG_LOG] newLayout:`, JSON.stringify(newLayout));

            // If it's a single-page layout, ensure all sections are included
            if (newLayout && newLayout.singlePage) {
                // console.log(`[DEBUG_LOG] Single-page layout, ensuring all sections are included`);
                // For single-page layouts, we don't need to do anything special as all sections are shown
            }
        }

        // console.log(`[DEBUG_LOG] Creating new portfolio with ${newSections.length} sections`);
        const newPortfolio = await portfolios.createPortfolio(
            new ObjectId(req.session.user.userId),
            initial.title + ' - Copy',
            initial.description,
            newSections,
            newLayout,
            initial.themeId,
            initial.contactButtonEnabled,
            false,
            initial._id
        );
        // console.log(`[DEBUG_LOG] New portfolio created: ID=${newPortfolio._id}, Title=${newPortfolio.title}`);
        // console.log(`[DEBUG_LOG] New portfolio has ${newPortfolio.sections ? newPortfolio.sections.length : 0} sections`);

        if (newPortfolio.layout && !newPortfolio.layout.singlePage && newPortfolio.layout.pages) {
            // console.log(`[DEBUG_LOG] New layout has ${newPortfolio.layout.pages.length} pages`);
            newPortfolio.layout.pages.forEach((page, i) => {
                // console.log(`[DEBUG_LOG] New page ${i}: title=${page.title}, sectionIds=${page.sectionIds ? page.sectionIds.map(id => id.toString()).join(', ') : 'none'}`);
            });
        }

        res.redirect('/users/profile');
    } catch (e) {
        console.error(e);
        res.status(500).send("Error copying portfolio");
    }
});

// Route to view a specific user's active portfolio
router.get('/user/:userId/portfolio', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get the user
        const userCollection = await usersCollection();
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).render('error', {
                title: 'User Not Found',
                error: 'The specified user does not exist'
            });
        }

        // Check if the user has an active portfolio
        if (!user.activePortfolioId) {
            return res.render('error', {
                title: 'No Active Portfolio',
                error: `This user does not have an active portfolio`
            });
        }

        // Get the portfolio directly instead of redirecting
        const portfolio = await portfolios.getPortfolioById(user.activePortfolioId);
        const pageIndex = req.query.page ? parseInt(req.query.page) : 0;

        // Get the theme for the portfolio
        let theme = null;
        try {
            theme = await themes.getThemeById(portfolio.themeId);
        } catch (e) {
            console.error("Error getting theme:", e);
            // If theme not found, continue without it
        }

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

        // Render the portfolio view directly
        res.render('portfolio', {
            title: portfolio.title,
            portfolio: portfolio,
            currentUser: req.session.user,
            currentPageIndex: currentPageIndex,
            filteredSections: filteredSections,
            theme: theme,
            isUserProfileRoute: true,
            userId: userId
        });
    } catch (e) {
        console.error("Error viewing user's active portfolio:", e);
        res.status(500).render('error', {
            title: 'Error',
            error: 'An error occurred while trying to view the user\'s active portfolio'
        });
    }
});

export default router;
