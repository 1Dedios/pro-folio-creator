// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static assets
app.use("/public", express.static(path.join(__dirname, "public")));

// Handlebars setup - explicit dirs for layouts + partials

// Handlebars setup (explicit layouts + partials + helpers)
const hbs = exphbs.create({
  extname: ".handlebars",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: {
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleString();
    },
    ifEquals(a, b, options) {
      return String(a) === String(b) ? options.fn(this) : options.inverse(this);
    },
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// wire existing routes
configRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
