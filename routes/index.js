import express from 'express';
import {messages, portfolios, themes, users} from '../data/index.js';
import pagesRouter from './pages.js';
import usersRouter from './users.js';
import privateRoutes from './private.js';

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
apiRouter.get('/themes', async (req, res) => {
  try {
    const allThemes = await themes.getAllThemes();
    res.json(allThemes);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get('/themes/examples', async (req, res) => {
  try {
    const exampleThemes = await themes.getExampleThemes();
    res.json(exampleThemes);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get('/themes/:id', async (req, res) => {
  try {
    const theme = await themes.getThemeById(req.params.id);
    res.json(theme);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

// Portfolio routes
apiRouter.get('/portfolios/examples', async (req, res) => {
  try {
    const examplePortfolios = await portfolios.getExamplePortfolios();
    res.json(examplePortfolios);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get('/portfolios/user/:userId', async (req, res) => {
  try {
    const userPortfolios = await portfolios.getPortfoliosByUserId(req.params.userId);
    res.json(userPortfolios);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get('/portfolios/:id', async (req, res) => {
  try {
    const portfolio = await portfolios.getPortfolioById(req.params.id);
    res.json(portfolio);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

// Message routes
apiRouter.get('/messages/portfolio/:portfolioId', async (req, res) => {
  try {
    const portfolioMessages = await messages.getMessagesByPortfolioId(req.params.portfolioId);
    res.json(portfolioMessages);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

apiRouter.get('/messages/user/:userId', async (req, res) => {
  try {
    const userMessages = await messages.getMessagesByUserId(req.params.userId);
    res.json(userMessages);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// Configure routes
const constructorMethod = (app) => {
  app.use('/', pagesRouter);
  app.use('/users', usersRouter);
  app.use('/api', apiRouter);
  app.use('/private', privateRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

export default constructorMethod;