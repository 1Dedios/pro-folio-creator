import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import configRoutes from "./routes/index.js";
import * as handlebarsHelpers from "./views/helpers.js";
import { closeConnection } from "./config/mongoConnection.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure express-handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      formatDate: handlebarsHelpers.formatDate,
      eq: handlebarsHelpers.eq,
      sortBy: handlebarsHelpers.sortBy,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(join(__dirname, "public")));
app.use(
  session({
    name: "ProFolio",
    secret: "ProFolioGlobalSessionSecret",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1800000 }, // maxAge in msec, set to 30 minutes (30 * 60 * 1000)
  })
);

// Make user session data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use("/private", (req, res, next) => {
  //console.log(`session.id: ${req.session.id}`)
  if (!req.session.user) {
    // no logged in user (no session.user info)
    return res.redirect("/"); // redirect to home page
  } else {
    next();
  }
});

app.use("/users/login", (req, res, next) => {
  if (req.session.user) {
    // user already logged in
    return res.redirect("/private");
    // once users profile page exists we should change this to user's profile 'portfolio/users/_id'
  } else {
    //req.method = 'POST';  // not needed since it will be a POST coming from the form
    console.log("middleware /users/login");
    next();
  }
});

// Configure routes
configRoutes(app);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

// Close DB on App exit
let isShuttingDown = false;

process.on("SIGINT", async () => {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log("\nBeginning DB Shutdown...");
  console.log("PRO-folio closing in 5 sec");
  setTimeout(dbShutdown, 5000);
});

const dbShutdown = async () => {
  try {
    await closeConnection();
    process.exit(0);
  } catch (e) {
    console.error("Error closing DB connection: ", e.message);
    process.exit(1);
  }
};
