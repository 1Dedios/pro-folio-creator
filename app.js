import express from 'express';
import {engine} from 'express-handlebars';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import configRoutes from './routes/index.js';
import * as handlebarsHelpers from './views/helpers.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure express-handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    formatDate: handlebarsHelpers.formatDate,
    eq: handlebarsHelpers.eq
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(join(__dirname, 'public')));

// Configure routes
configRoutes(app);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
