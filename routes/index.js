// routes/index.js
import express from "express";
import { users, messages, themes, portfolios } from "../data/index.js";
import pagesRouter from "./pages.js";

const router = express.Router();

// User routes
router.get("/users/:id", async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.toString ? e.toString() : e });
  }
});

// Theme routes
router.get("/themes", async (req, res) => {
  try {
    const allThemes = await themes.getAllThemes();
    res.json(allThemes);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.get("/themes/examples", async (req, res) => {
  try {
    const exampleThemes = await themes.getExampleThemes();
    res.json(exampleThemes);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.get("/themes/:id", async (req, res) => {
  try {
    const theme = await themes.getThemeById(req.params.id);
    res.json(theme);
  } catch (e) {
    res.status(404).json({ error: e.toString ? e.toString() : e });
  }
});

// Portfolio routes
router.get("/portfolios/examples", async (req, res) => {
  try {
    const examplePortfolios = await portfolios.getExamplePortfolios();
    res.json(examplePortfolios);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.get("/portfolios/user/:userId", async (req, res) => {
  try {
    const userPortfolios = await portfolios.getPortfoliosByUserId(
      req.params.userId
    );
    res.json(userPortfolios);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.get("/portfolios/:id", async (req, res) => {
  try {
    const portfolio = await portfolios.getPortfolioById(req.params.id);
    res.json(portfolio);
  } catch (e) {
    res.status(404).json({ error: e.toString ? e.toString() : e });
  }
});

// Message routes
router.get("/messages/portfolio/:portfolioId", async (req, res) => {
  try {
    const portfolioMessages = await messages.getMessagesByPortfolioId(
      req.params.portfolioId
    );
    res.json(portfolioMessages);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.get("/messages/user/:userId", async (req, res) => {
  try {
    const userMessages = await messages.getMessagesByUserId(req.params.userId);
    res.json(userMessages);
  } catch (e) {
    res.status(500).json({ error: e.toString ? e.toString() : e });
  }
});

router.post("/portfolios/:id/delete", async (req, res) => {
  const portfolioId = req.params.id;
  const userId = req.body.userId;

  console.log(
    `DELETE request for portfolioId=${portfolioId} by userId=${userId}`
  );

  try {
    const portfolio = await portfolios.getPortfolioById(portfolioId);

    if (String(portfolio.ownerId) !== String(userId)) {
      console.warn("Delete attempt by non-owner", { portfolioId, userId });
      if (
        req.xhr ||
        req.get("X-Requested-With") === "XMLHttpRequest" ||
        req.accepts("json")
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
      return res
        .status(403)
        .render("home", { title: "Profolio", error: "Forbidden" });
    }

    await portfolios.removePortfolio(portfolioId);
    console.log("Deleted portfolio", portfolioId);

    if (
      req.xhr ||
      req.get("X-Requested-With") === "XMLHttpRequest" ||
      req.accepts("json")
    ) {
      return res.json({ deleted: true, portfolioId });
    }

    // Non-AJAX fallback: redirect
    return res.redirect(303, `/profile/${userId}`);
  } catch (err) {
    console.error(
      "Error deleting portfolio:",
      err && err.stack ? err.stack : err
    );
    if (
      req.xhr ||
      req.get("X-Requested-With") === "XMLHttpRequest" ||
      req.accepts("json")
    ) {
      return res.status(500).json({ error: "Could not delete portfolio" });
    }
    // Non-AJAX fallback
    return res.redirect(303, `/profile/${userId}`);
  }
});

// Activate a portfolio (supports AJAX)
router.post("/portfolios/:id/activate", async (req, res) => {
  try {
    const portfolioId = req.params.id;
    const userId = req.body.userId; // comes from the hidden input in the form

    // verify portfolio exists
    const portfolio = await portfolios.getPortfolioById(portfolioId);

    // ensure the current profile owner is the portfolio owner
    if (String(portfolio.ownerId) !== String(userId)) {
      console.warn("Activate attempt by non-owner", { portfolioId, userId });
      if (
        req.xhr ||
        req.get("X-Requested-With") === "XMLHttpRequest" ||
        req.accepts("json")
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
      return res
        .status(403)
        .render("home", { title: "Profolio", error: "Forbidden" });
    }

    // set active portfolio for the user
    await users.updateActivePortfolio(userId, portfolioId);

    if (
      req.xhr ||
      req.get("X-Requested-With") === "XMLHttpRequest" ||
      req.accepts("json")
    ) {
      return res.json({
        success: true,
        userId,
        activePortfolioId: portfolioId,
      });
    }

    // redirect back to the profile page for non-AJAX
    return res.redirect(`/profile/${userId}`);
  } catch (err) {
    console.error(
      "Error activating portfolio:",
      err && err.stack ? err.stack : err
    );
    if (
      req.xhr ||
      req.get("X-Requested-With") === "XMLHttpRequest" ||
      req.accepts("json")
    ) {
      return res.status(500).json({ error: "Could not activate portfolio" });
    }
    return res.status(500).render("home", {
      title: "Profolio",
      error: "Could not activate portfolio",
    });
  }
});

// Configure routes
const constructorMethod = (app) => {
  app.use("/", pagesRouter);

  app.use("/api", router);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
