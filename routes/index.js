import express from "express";
import { messages, portfolios, themes, users } from "../data/index.js";
import contactFormRoute from "./contactForm.js";
import pagesRouter from "./pages.js";
import usersRouter from "./users.js";
import privateRoutes from "./private.js";

const apiRouter = express.Router();

// User routes
// moved to routes/users.js
/*router.get('/users/:id', async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});*/

// Theme routes
apiRouter.get("/themes", async (req, res) => {
  try {
    // Check if user is logged in
    const userId = req.session.user ? req.session.user.userId : null;

    // Get all example themes
    const exampleThemes = await themes.getExampleThemes();

    // Get user's themes if logged in
    let userThemes = [];
    if (userId) {
        userThemes = await themes.getAllThemes(userId);
    }

    // Combine and return all themes
    const allThemes = [...exampleThemes, ...userThemes];
    res.json(allThemes);
  } catch (e) {
    console.error('Error getting themes:', e);
    res.status(500).json({ error: 'Failed to get themes' });
  }
});

apiRouter.get("/themes/examples", async (req, res) => {
  try {
    const exampleThemes = await themes.getExampleThemes();
    res.json(exampleThemes);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get("/themes/:id", async (req, res) => {
  try {
    const theme = await themes.getThemeById(req.params.id);
    res.json(theme);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

// Create a new theme
apiRouter.post("/themes", async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'You must be logged in to create a theme' });
    }

    const userId = req.session.user.userId;
    const { name, themeData } = req.body;

    // Validate input
    if (!name || !themeData) {
      return res.status(400).json({ error: 'Name and theme data are required' });
    }

    if (!themeData.backgroundColor || !themeData.sectionColor || !themeData.textColor) {
      return res.status(400).json({ error: 'Theme data must include backgroundColor, sectionColor, and textColor' });
    }

    // Create the theme
    const newTheme = await themes.createTheme(
      userId,
      name,
      themeData,
      false // Not an example theme
    );

    res.status(201).json(newTheme);
  } catch (e) {
    console.error('Error creating theme:', e);
    res.status(500).json({ error: 'Failed to create theme' });
  }
});

// Portfolio routes
apiRouter.get("/portfolios/examples", async (req, res) => {
  try {
    const examplePortfolios = await portfolios.getExamplePortfolios();
    res.json(examplePortfolios);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get("/portfolios/user/:userId", async (req, res) => {
  try {
    const userPortfolios = await portfolios.getPortfoliosByUserId(
      req.params.userId
    );
    res.json(userPortfolios);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get("/portfolios/:id", async (req, res) => {
  try {
    const portfolio = await portfolios.getPortfolioById(req.params.id);
    res.json(portfolio);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

// Activate a portfolio (set as user's active portfolio)
apiRouter.post("/portfolios/:id/activate", async (req, res) => {
  try {
    // must be logged in (we rely on session.user.userId)
    if (!req.session || !req.session.user || !req.session.user.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }
    const userId = req.session.user.userId;
    const portfolioId = req.params.id;

    // verify portfolio exists and is owned by this user
    const portfolio = await portfolios.getPortfolioById(portfolioId);
    if (!portfolio)
      return res.status(404).json({ error: "Portfolio not found" });

    // owner check (ownerId may be ObjectId; convert to string)
    if (String(portfolio.ownerId) !== String(userId)) {
      console.warn("Activate attempt by non-owner", { portfolioId, userId });
      return res.status(403).json({ error: "Not authorized" });
    }

    // update user's active portfolio
    const updatedUser = await users.updateActivePortfolio(userId, portfolioId);
    return res.json({
      success: true,
      userId: updatedUser._id ? String(updatedUser._id) : userId,
      activePortfolioId: updatedUser.activePortfolioId
        ? String(updatedUser.activePortfolioId)
        : portfolioId,
    });
  } catch (e) {
    console.error("Error activating portfolio:", e);
    return res.status(500).json({ error: String(e) });
  }
});

// Delete a portfolio
apiRouter.post('/portfolios/:id/delete', async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    const userId = req.session.user.userId;
    const portfolioId = req.params.id;

    // verify portfolio exists and is owned by this user
    const portfolio = await portfolios.getPortfolioById(portfolioId);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    if (String(portfolio.ownerId) !== String(userId)) {
      console.warn('Delete attempt by non-owner', { portfolioId, userId });
      return res.status(403).json({ error: 'Not authorized' });
    }

    // perform deletion (this should also unset activePortfolioId in data layer)
    const result = await portfolios.removePortfolio(portfolioId);
    return res.json({ deleted: true, portfolioId: portfolioId });
  } catch (e) {
    console.error('Error deleting portfolio:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Message routes
apiRouter.get("/messages/portfolio/:portfolioId", async (req, res) => {
  try {
    const portfolioMessages = await messages.getMessagesByPortfolioId(
      req.params.portfolioId
    );
    res.json(portfolioMessages);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get("/messages/user/:userId", async (req, res) => {
  try {
    const userMessages = await messages.getMessagesByUserId(req.params.userId);
    res.json(userMessages);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// Configure routes
const constructorMethod = (app) => {
  app.use("/", pagesRouter);
  app.use("/users", usersRouter);
  app.use("/api", apiRouter);
  app.use("/private", privateRoutes);
  app.use("/contact-form", contactFormRoute);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
