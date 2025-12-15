import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { 
  validateString, 
  validateObjectId, 
  validateEmail,
  validatePassword,
  validateBoolean
} from '../helpers.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// Username validation
const validateUsername = (username) => {
  username = validateString(username, 'Username');
  if (username.length < 3) throw 'Username must be at least 3 characters long';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw 'Username can only contain letters, numbers, and underscores';
  return username;
};

// Create a new user
export const createUser = async (username, email, password) => {
  username = validateUsername(username.toLowerCase());
  email = validateEmail(email.toLowerCase());
  password = validatePassword(password);

  // Check if username or email already exists
  const userCollection = await users();
  const existingUser = await userCollection.findOne({
    $or: [{ username: username }, { email: email }]
  });

  if (existingUser) {
    if (existingUser.username === username) throw 'Username already exists';
    if (existingUser.email === email) throw 'Email already exists';
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create the new user
  const newUser = {
    username,
    email,
    hashedPassword,
    profilePictureId: null,
    activePortfolioId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert the new user
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add user';
  }

  // Return the new user (without the password)
  const user = await getUserById(insertInfo.insertedId.toString());
  return user;
};

// Get a user by ID
export const getUserById = async (userId) => {
  userId = validateObjectId(userId);
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: userId });
  if (!user) throw 'User not found';

  // Remove the hashed password before returning
  const { hashedPassword, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get a user by username
export const getUserByUsername = async (username) => {
  username = validateUsername(username);
  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });
  if (!user) throw 'User not found';

  // Remove the hashed password before returning
  const { hashedPassword, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get a user by email
export const getUserByEmail = async (email) => {
  email = validateEmail(email);
  const userCollection = await users();
  const user = await userCollection.findOne({ email: email });
  if (!user) throw 'User not found';

  // Remove the hashed password before returning
  const { hashedPassword, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Update a user's profile picture
export const updateProfilePicture = async (userId, profilePictureId) => {
  userId = validateObjectId(userId);
  profilePictureId = validateObjectId(profilePictureId);

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: userId },
    { 
      $set: { 
        profilePictureId: profilePictureId,
        updatedAt: new Date()
      } 
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update profile picture';
  return await getUserById(userId);
};

// Update a user's active portfolio
export const updateActivePortfolio = async (userId, portfolioId) => {
  userId = validateObjectId(userId);
  portfolioId = validateObjectId(portfolioId);

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: userId },
    { 
      $set: { 
        activePortfolioId: portfolioId,
        updatedAt: new Date()
      } 
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update active portfolio';
  return await getUserById(userId);
};

// Check user credentials for login
export const checkUser = async (emailOrUsername, password) => {
  emailOrUsername = validateString(emailOrUsername, 'Email or username');
  password = validateString(password, 'Password');

  const userCollection = await users();
  const user = await userCollection.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });

  if (!user) throw 'Either the email/username or password is invalid';

  // Compare the provided password with the stored hashed password
  const match = await bcrypt.compare(password, user.hashedPassword);
  if (!match) throw 'Either the email/username or password is invalid';

  // Remove the hashed password before returning
  const { hashedPassword, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Delete a user
export const removeUser = async (userId) => {
  userId = validateObjectId(userId);
  const userCollection = await users();
  const deletionInfo = await userCollection.deleteOne({ _id: userId });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete user';
  return { userId: userId.toString(), deleted: true };
};