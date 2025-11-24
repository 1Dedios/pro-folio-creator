import express from 'express';
import { users } from '../data/index.js';
import bcrypt from 'bcrypt';
const router = express.Router();

const saltRounds = 10;

router.get('/', async (req, res) => {
  //what should we load here, if anything?  List all users??
});

//get users/signup page with form to fill out
router.get('/signup', async (req, res) => {
  try {
    console.log("render get users/signup");
    res.render('users/signup', { title: 'ProFolio User Sign Up'});
  }
  catch (e) {
    console.log("error rendering users/signup");
    res.status(500).json({ error: e});
  }
});

//post users/signup to create new user
router.post('/signup', async (req, res) => {
  try {
    console.log("post users/signup");
    const newUserData = req.body;
    console.log(newUserData);
    const newUserName = newUserData.username;
    const newEmail = newUserData.email;
    const newPassword = newUserData.password;
    const newUser = await users.createUser(newUserName, newEmail, newPassword);
    //to-do: handle what to do after user is created, right now just showing the json user data
    // maybe back to login page or directly to their default portfolio '/portfolios/user/:userId'
    res.json(newUser);  
  }
  catch (e) {
    console.log("error post users/signup");
    //to-do: have a better way to handle error when creating user: probably take them back to signup page
    //to-do: also need to add client-side form validation
    res.status(500).json({error: e});
  }
});

//get users/login page with login form
router.get('/login', async (req, res) => {
  try {
    console.log("render get users/login");
    res.render('users/login', { title: 'ProFolio Login Page'});
  }
  catch (e) {
    console.log("error rendering users/login");
    res.status(500).json({ error: e});  // to-do: better error message
  }
});

//post users/login to log in user & create session.user info
router.post('/login', async (req, res) => {
  console.log("post users/login");
  const { username, password } = req.body;
  let user = {};
  try {
    user = await users.getUserByUsername(username);
    console.log(`user found with id: ${user._id}`)
    console.log(user);
  }
  catch (e) {
    console.log("no username found in /users/login");
    return res.status(500).json({ error: e});  // to-do: better error message
  }
  console.log(user.username);
  let match = {};
  try {
    match = await users.checkUser(username, password);  //checkUser throws error if passwords don't match
    req.session.user = {
      firstName: user.firstName, 
      lastName: user.lastName,
      userId: user.id
    }
    res.redirect('/private');
  // where should we redirect the user after they're logged in??
  // probably their portfolio page '/portfolios/user/:userId' but that doesn't exist yet
  // '/private' is just what I did for a start since it's what the lecture used
  }
  catch (e) {   // checkUser failed
    console.log(`error from checkUser ${e}`);
    return res.status(500).json({error: e});
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