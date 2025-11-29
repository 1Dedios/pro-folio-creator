// data/themes.js
import { ObjectId } from "mongodb";
import { themes } from "../config/mongoCollections.js";
import { validateString, validateObjectId } from "../helpers.js";

// Validate theme name
const validateThemeName = (name) => {
  name = validateString(name, "Theme name");
  if (name.length < 3) throw "Theme name must be at least 3 characters long";
  return name;
};

// Create a new theme
export const createTheme = async (userId, themeName, themeData) => {
  userId = validateObjectId(userId);
  themeName = validateThemeName(themeName);

  if (typeof themeData !== "object") throw "themeData must be an object";

  const themeCollection = await themes();
  const existingTheme = await themeCollection.findOne({
    themeName: themeName,
    ownerId: userId,
  });

  if (existingTheme) throw "Theme with this name already exists";

  const newTheme = {
    ownerId: userId,
    themeName,
    themeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertInfo = await themeCollection.insertOne(newTheme);
  if (!insertInfo.acknowledged) throw "Could not create theme";

  return await getThemeById(insertInfo.insertedId.toString());
};

// Get theme by ID
export const getThemeById = async (themeId) => {
  themeId = validateObjectId(themeId);
  const themeCollection = await themes();
  const theme = await themeCollection.findOne({ _id: themeId });
  if (!theme) throw "Theme not found";
  return theme;
};

// Get all themes for a user
export const getThemesByUserId = async (userId) => {
  userId = validateObjectId(userId);
  const themeCollection = await themes();
  return await themeCollection.find({ ownerId: userId }).toArray();
};

// Update a theme
export const updateTheme = async (themeId, themeData) => {
  themeId = validateObjectId(themeId);
  if (typeof themeData !== "object") throw "themeData must be an object";

  const themeCollection = await themes();
  const updateInfo = await themeCollection.updateOne(
    { _id: themeId },
    { $set: { themeData, updatedAt: new Date() } }
  );

  if (updateInfo.modifiedCount === 0) throw "Could not update theme";

  return await getThemeById(themeId);
};

// Delete a theme
export const removeTheme = async (themeId) => {
  themeId = validateObjectId(themeId);
  const themeCollection = await themes();
  const deletionInfo = await themeCollection.deleteOne({ _id: themeId });
  if (deletionInfo.deletedCount === 0) throw "Could not delete theme";
  return { themeId: themeId.toString(), deleted: true };
};
