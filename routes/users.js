import express from 'express';
import { users } from '../data/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  //what should we load here, if anything?  List all users??
});

router.get('/:id', async (req, res) => {
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
    console.log(newUserName);
    console.log(newPassword);
    const newUser = createUser(newUserName, newEmail, newPassword);
    res.render()
  }
  catch (e) {
    console.log("error post users/signup");
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
});

export default router;