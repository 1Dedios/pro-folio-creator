// Renders views/profile.handlebars and passes user + portfolios to template

// routes/pages.js
import express from "express";
import { users, portfolios } from "../data/index.js";

const router = express.Router();

router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userObj = await users.getUserById(userId); // use existing data/users.js
    const userPortfolios = await portfolios.getPortfoliosByUserId(userId); // uses data/portfolios.js
    res.render("profile", {
      title: `${userObj.username}'s profile`,
      user: userObj,
      portfolios: userPortfolios,
      year: new Date().getFullYear(),
    });
  } catch (err) {
    console.error(
      "Error fetching profile for userId=",
      req.params.userId,
      err && err.stack ? err.stack : err
    );
    return res
      .status(404)
      .render("home", { title: "Profolio", error: "User not found" });
  }
});

export default router;
