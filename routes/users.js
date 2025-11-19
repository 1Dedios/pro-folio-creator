import express from 'express';
import { users } from '../data/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  //what should we load here, if anything?  List all users??
});

router.get('/id/:id', async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

//get users/signup page with form
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
    res.status(500).json({ error: e});
  }
});

//post users/login to log in 
router.post('/login', async (req, res) => {


  //where should we take the user after they're logged in??
  // probably their portfolio page '/portfolios/user/:userId'
});

export default router;