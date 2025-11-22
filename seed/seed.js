// seed/seed.js (ESM)
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_db";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("connected");

  // clear existing
  await User.deleteMany({});
  await Portfolio.deleteMany({});

  const user = await User.create({
    username: "kartik",
    email: "kartik@example.com",
  });

  const p1 = await Portfolio.create({
    ownerId: user._id,
    title: "Fullstack Portfolio",
    description: "One-page portfolio showing projects and experience",
    sections: ["education", "projects", "experience"],
  });

  const p2 = await Portfolio.create({
    ownerId: user._id,
    title: "Research & Publications",
    description: "Focus on publications and research",
    sections: ["publications", "skills"],
  });

  await User.findByIdAndUpdate(user._id, { activePortfolioId: p1._id });

  console.log("seeded", { user: user._id, p1: p1._id, p2: p2._id });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
