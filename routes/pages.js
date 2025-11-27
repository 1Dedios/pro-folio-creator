// routes/pages.js
import express from "express";
import { users, portfolios } from "../data/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let demoUser = null;
    try {
      demoUser = await users.getUserByUsername("kartik");
    } catch (e) {
      demoUser = null;
    }

    return res.render("home", {
      title: "Profolio",
      user: demoUser || null,
    });
  } catch (err) {
    console.error("Error rendering home:", err);
    return res.render("home", { title: "Profolio", user: null });
  }
});

router.get("/create", (req, res) => {
  res.render("create", { title: "Create Your Own Portfolio" });
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userObj = await users.getUserById(userId);
    const userPortfolios = await portfolios.getPortfoliosByUserId(userId);
    res.render("profile", {
      title: `${userObj.username}'s profile`,
      user: userObj,
      portfolios: userPortfolios,
      year: new Date().getFullYear(),
    });
  } catch (err) {
    console.error("Error fetching profile for userId=", req.params.userId, err);
    return res.status(404).render("home", {
      title: "Profolio",
      error: "User not found",
      user: null,
    });
  }
});

export default router;
