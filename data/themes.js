import { ObjectId } from 'mongodb';
import { themes } from '../config/mongoCollections.js';
import { 
  validateString, 
  validateObjectId, 
  validateBoolean
} from '../helpers.js';

// Validate theme name
const validateThemeName = (name) => {
  name = validateString(name, 'Theme name');
  if (name.length < 3) throw 'Theme name must be at least 3 characters long';
  return name;
};

// Validate theme data
const validateThemeData = (themeData) => {
  if (!themeData || typeof themeData !== 'object' || Array.isArray(themeData)) {
    throw 'Theme data must be an object';
  }

  // Validate required fields
  if (!themeData.backgroundColor) throw 'Theme data must include backgroundColor';
  if (!themeData.sectionColor) throw 'Theme data must include sectionColor';
  if (!themeData.textColor) throw 'Theme data must include textColor';

  // Validate color formats (hex codes)
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(themeData.backgroundColor)) throw 'Background color must be a valid hex color code';
  if (!colorRegex.test(themeData.sectionColor)) throw 'Section color must be a valid hex color code';
  if (!colorRegex.test(themeData.textColor)) throw 'Text color must be a valid hex color code';

  return themeData;
};

// Create a new theme
export const createTheme = async (ownerId, name, themeData, isExample = false) => {
  // ownerId can be null for system themes
  if (ownerId !== null) {
    ownerId = validateObjectId(ownerId);
  }

  name = validateThemeName(name);
  themeData = validateThemeData(themeData);
  isExample = validateBoolean(isExample, 'Is example');

  // Create the new theme
  const newTheme = {
    ownerId,
    name,
    themeData,
    isExample,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert the new theme
  const themeCollection = await themes();
  const insertInfo = await themeCollection.insertOne(newTheme);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add theme';
  }

  // Return the new theme
  return await getThemeById(insertInfo.insertedId.toString());
};

// Get a theme by ID
export const getThemeById = async (themeId) => {
  themeId = validateObjectId(themeId);
  const themeCollection = await themes();
  const theme = await themeCollection.findOne({ _id: themeId });
  if (!theme) throw 'Theme not found';
  return theme;
};

// Get all themes (optionally filtered by owner)
export const getAllThemes = async (ownerId = null) => {
  const themeCollection = await themes();
  let query = {};

  if (ownerId !== null) {
    ownerId = validateObjectId(ownerId);
    query = { ownerId };
  }

  const themeList = await themeCollection.find(query).toArray();
  return themeList;
};

// Get all example themes
export const getExampleThemes = async () => {
  const themeCollection = await themes();
  const themeList = await themeCollection.find({ isExample: true }).toArray();
  return themeList;
};

// Update a theme
export const updateTheme = async (themeId, name, themeData) => {
  themeId = validateObjectId(themeId);
  name = validateThemeName(name);
  themeData = validateThemeData(themeData);

  // Get the existing theme to check ownership
  const existingTheme = await getThemeById(themeId);

  // Don't allow updating example themes
  if (existingTheme.isExample) {
    throw 'Cannot update example themes';
  }

  const updateInfo = await themes().updateOne(
    { _id: themeId },
    { 
      $set: { 
        name,
        themeData,
        updatedAt: new Date()
      } 
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update theme';
  return await getThemeById(themeId);
};

// Delete a theme
export const removeTheme = async (themeId) => {
  themeId = validateObjectId(themeId);

  // Get the existing theme to check if it's an example
  const existingTheme = await getThemeById(themeId);

  // Don't allow deleting example themes
  if (existingTheme.isExample) {
    throw 'Cannot delete example themes';
  }

  const themeCollection = await themes();
  const deletionInfo = await themeCollection.deleteOne({ _id: themeId });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete theme';
  return { themeId: themeId.toString(), deleted: true };
};

// Clone a theme for a user
export const cloneTheme = async (themeId, ownerId, newName = null) => {
  themeId = validateObjectId(themeId);
  ownerId = validateObjectId(ownerId);

  // Get the theme to clone
  const themeToClone = await getThemeById(themeId);

  // Set the new name or use the original with " (Copy)" appended
  const name = newName ? validateThemeName(newName) : `${themeToClone.name} (Copy)`;

  // Create a new theme based on the cloned one
  return await createTheme(ownerId, name, themeToClone.themeData, false);
};
