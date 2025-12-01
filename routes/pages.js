// routes/pages.js
import express from "express";
import { users, portfolios } from "../data/index.js"; // data layer module

const router = express.Router();

// helper: build userJson string or 'null'
const buildUserJson = (user) => {
  if (!user) return "null";
  // make a minimal safe object for client-side use
  const u = {
    _id: user._id ? user._id.toString() : null,
    username: user.username || null,
    email: user.email || null,
    // if you store a profilePictureId or URL, include it; else null
    profilePictureUrl: user.profilePictureUrl || null,
  };
  return JSON.stringify(u);
};

// Home
router.get("/", async (req, res) => {
  try {
    // Try to find a demo user 'kartik' (seed creates this). If not found, user = null.
    let demoUser = null;
    try {
      demoUser = await users.getUserByUsername("devwalker");
    } catch (e) {
      // not found — keep null
      demoUser = null;
    }

    res.render("home", {
      title: "Profolio",
      user: demoUser || null,
      userJson: buildUserJson(demoUser),
    });
  } catch (e) {
    console.error("Error rendering home page:", e);
    res
      .status(500)
      .render("error", { message: "Internal Server Error", error: String(e) });
  }
});

// Create page
router.get("/create", async (req, res) => {
  try {
    let demoUser = null;
    try {
      demoUser = await users.getUserByUsername("kartik");
    } catch (e) {
      demoUser = null;
    }

    res.render("create", {
      title: "Create Your Own Portfolio",
      user: demoUser || null,
      userJson: buildUserJson(demoUser),
    });
  } catch (e) {
    console.error("Error rendering create page:", e);
    res
      .status(500)
      .render("error", { message: "Internal Server Error", error: String(e) });
  }
});

// Profile route (optional — keep if you render profile server-side)
router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // get user
    const userObj = await users.getUserById(userId);

    // get portfolios for this user (always pass an array so template logic is safe)
    let userPortfolios = [];
    try {
      userPortfolios = await portfolios.getPortfoliosByUserId(userId);
      if (!Array.isArray(userPortfolios)) userPortfolios = [];
    } catch (e) {
      console.warn("Warning fetching portfolios for user:", userId, e);
      userPortfolios = [];
    }

    return res.render("profile", {
      title: `${userObj.username}'s profile`,
      user: userObj,
      portfolios: userPortfolios,
      year: new Date().getFullYear(),
    });
  } catch (err) {
    console.error("Error fetching profile for userId=", req.params.userId, err);
    return res
      .status(404)
      .render("home", { title: "Profolio", error: "User not found" });
  }
});

export default router;
