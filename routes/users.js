import express from 'express';
import { users, portfolios } from '../data/index.js';
import bcrypt from 'bcrypt';
const router = express.Router();

const saltRounds = 10;

router.get('/', async (req, res) => {
  //what should we load here, if anything?  List all users??
});

router.get('/id/:id', async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    return res.status(404).render('error', {title: 'Page Not Found', error: e});
  }
});

//get users/signup page with form
router.get('/signup', async (req, res) => {
  try {
    // console.log("render get users/signup");
    return res.render('users/signup', { title: 'ProFolio User Sign Up'});
  }
  catch (e) {
    // console.log("error rendering users/signup");
    return res.status(500).render('error', {title: 'Error', error: e});
  }
});

//post users/signup to create new user
router.post('/signup', async (req, res) => {
  try {
    // console.log("post users/signup");
    const newUserData = req.body;
    // console.log(newUserData);
    const newUserName = newUserData.username;
    const newEmail = newUserData.email;
    const newPassword = newUserData.password;
    const newUser = await users.createUser(newUserName, newEmail, newPassword);

    // Set session data to log in the user automatically
    req.session.user = {
      username: newUser.username,
      email: newUser.email,
      userId: newUser._id.toString()
    };

    // Redirect to user profile page
    res.redirect('/users/profile');
  }
  catch (e) {
    // console.log("error post users/signup");
    //to-do: have a better way to handle error when creating user: probably take them back to signup page
    //to-do: also need to add client-side form validation
    res.status(500).json({error: e});
  }
});

//get users/login page with login form
router.get('/login', async (req, res) => {
  try {
    // console.log("render get users/login");
    res.render('users/login', { title: 'ProFolio Login Page'});
  }
  catch (e) {
    // console.log("error rendering users/login");
    res.status(500).json({ error: e});  // to-do: better error message
  }
});

//post users/login to log in user & create session.user info
router.post('/login', async (req, res) => {
  // console.log("post users/login");
  const { username, password } = req.body;
  let user = {};
  try {
    user = await users.getUserByUsername(username);
    // console.log(`user found with id: ${user._id}`)
    // console.log(user);
  }
  catch (e) {
    // console.log("no username found in /users/login");
    return res.status(500).json({ error: e});  // to-do: better error message
  }
  // console.log(user.username);
  let match = {};
  try {
    match = await users.checkUser(username, password);  //checkUser throws error if passwords don't match
    req.session.user = {  // setting session.user to indicate that the user is logged in
      username: user.username,
      email: user.email,
      userId: user._id.toString()
    }
    res.redirect('/users/profile');
  // Redirecting to the user profile page after successful login
  }
  catch (e) {   // checkUser failed
    // console.log(`error from checkUser ${e}`);
    return res.status(500).json({error: e});  // probably change this to 401 or 403 for unauathorized user
  }
});

router.get('/logout', async (req, res) => { // need to add /users/logout link for template of any page where a user is logged in
  req.session.destroy();
  //res.send('Logged out');
  res.redirect('/');
});

router.get('/profile', async (req, res) => {
  // Check if user is logged in
  if (!req.session?.user) {
    return res.redirect('/users/login');
  }

  try {
    // Load full user from DB
    const fullUser = await users.getUserById(req.session?.user.userId);
    if (!fullUser) {
      // console.log('User not found for session id:', req.session?.user.userId);
      return res.status(404).render('error', { message: 'User not found' });
    }

    // Load user's portfolios
    let userPortfolios = await portfolios.getPortfoliosByUserId(req.session?.user.userId);
    userPortfolios = (userPortfolios || []).map((p) => ({
      ...p,
      _id: String(p._id),
      ownerId: String(p.ownerId),
    }));

    // Normalise fullUser for templates (string IDs)
    const userForTemplate = {
      ...fullUser,
      _id: String(fullUser._id),
      activePortfolioId: fullUser.activePortfolioId ? String(fullUser.activePortfolioId) : null
    };



    // create JSON string to be safely injected into client JS
    const userJson = JSON.stringify({
  _id: userForTemplate._id,
  username: userForTemplate.username,
  activePortfolioId: userForTemplate.activePortfolioId || null
  });

    // Pass user JSON string for client JS and the normal user object for templates
    res.render('users/profile', {
      title: 'User Profile',
      firstName: req.session?.user.username,
      user: userForTemplate,
      portfolios: userPortfolios,
      userJson// <-- important
    });
  } catch (e) {
    // console.log("Error rendering user profile page:", e);
    res.status(500).json({ error: e });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    // to-do: change this to list user info & show their picture
    res.json(user); 
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

export default router;
