import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import configRoutes from './routes/index.js';
<<<<<<< HEAD
import exphbs from 'express-handlebars';
=======
import * as handlebarsHelpers from './views/helpers.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
>>>>>>> main

const app = express();

<<<<<<< HEAD
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

=======
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
app.use(
  session({
    name: 'ProFolio',
    secret: 'ProFolioGlobalSessionSecret',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 } // maxAge in msec, so this is just 60 seconds, probably should extend that
  })
)

app.use('/private', (req, res, next) => {
  //console.log(`session.id: ${req.session.id}`)
  if (!req.session.user) {  // no logged in user (no session.user info)
    return res.redirect('/'); // redirect to home page
  }
  else {
    next();
  }
});

app.use('/users/login', (req, res, next) => {
  if (req.session.user) {   // user already logged in
    return res.redirect('/private');
    // once users profile page exists we should change this to user's profile 'portfolio/users/_id'
  }
  else {
    //req.method = 'POST';  // not needed since it will be a POST coming from the form
    console.log('middleware /users/login')
    next();
  }
});

// Configure routes
>>>>>>> main
configRoutes(app);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
