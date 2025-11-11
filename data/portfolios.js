import { ObjectId } from 'mongodb';
import { portfolios } from '../config/mongoCollections.js';
import { users } from '../config/mongoCollections.js';
import { themes } from '../config/mongoCollections.js';
import { 
  validateString, 
  validateObjectId, 
  validateBoolean,
  validateEmail,
  validateDate,
  validateArray,
  validateUrl
} from '../helpers.js';

// Validate portfolio title
const validateTitle = (title) => {
  title = validateString(title, 'Portfolio title');
  if (title.length < 3) throw 'Portfolio title must be at least 3 characters long';
  return title;
};

// Validate portfolio description
const validateDescription = (description) => {
  description = validateString(description, 'Portfolio description');
  return description;
};

// Validate section type
const validateSectionType = (type) => {
  type = validateString(type, 'Section type');
  const validTypes = ['education', 'work', 'certification', 'project', 'custom'];
  if (!validTypes.includes(type)) {
    throw `Section type must be one of: ${validTypes.join(', ')}`;
  }
  return type;
};

// Validate education section item
const validateEducationItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw 'Education item must be an object';
  }

  item.institution = validateString(item.institution, 'Institution');
  item.degree = validateString(item.degree, 'Degree');

  if (item.startDate) {
    item.startDate = new Date(item.startDate);
  }

  if (item.endDate) {
    item.endDate = new Date(item.endDate);
  }

  if (item.description) {
    item.description = validateString(item.description, 'Description');
  }

  if (item.location) {
    item.location = validateString(item.location, 'Location');
  }

  if (item.order === undefined) {
    item.order = 0;
  } else if (typeof item.order !== 'number') {
    throw 'Order must be a number';
  }

  return item;
};

// Validate work experience section item
const validateWorkItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw 'Work experience item must be an object';
  }

  item.company = validateString(item.company, 'Company');
  item.role = validateString(item.role, 'Role');

  if (item.startDate) {
    item.startDate = new Date(item.startDate);
  }

  if (item.endDate) {
    item.endDate = new Date(item.endDate);
  }

  if (item.description) {
    item.description = validateString(item.description, 'Description');
  }

  if (item.location) {
    item.location = validateString(item.location, 'Location');
  }

  if (item.achievements) {
    item.achievements = validateArray(item.achievements, 'Achievements', (achievement) => {
      return validateString(achievement, 'Achievement');
    });
  }

  if (item.order === undefined) {
    item.order = 0;
  } else if (typeof item.order !== 'number') {
    throw 'Order must be a number';
  }

  return item;
};

// Validate certification section item
const validateCertificationItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw 'Certification item must be an object';
  }

  item.title = validateString(item.title, 'Certification title');
  item.issuer = validateString(item.issuer, 'Issuer');

  if (item.issueDate) {
    item.issueDate = new Date(item.issueDate);
  }

  if (item.expirationDate) {
    item.expirationDate = new Date(item.expirationDate);
  }

  if (item.description) {
    item.description = validateString(item.description, 'Description');
  }

  if (item.order === undefined) {
    item.order = 0;
  } else if (typeof item.order !== 'number') {
    throw 'Order must be a number';
  }

  return item;
};

// Validate project section item
const validateProjectItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw 'Project item must be an object';
  }

  item.title = validateString(item.title, 'Project title');

  if (item.description) {
    item.description = validateString(item.description, 'Description');
  }

  if (item.technologies) {
    item.technologies = validateArray(item.technologies, 'Technologies', (tech) => {
      return validateString(tech, 'Technology');
    });
  }

  if (item.startDate) {
    item.startDate = new Date(item.startDate);
  }

  if (item.endDate) {
    item.endDate = new Date(item.endDate);
  }

  if (item.githubRepo) {
    item.githubRepo = validateUrl(item.githubRepo, 'GitHub repository URL');
  }

  if (item.order === undefined) {
    item.order = 0;
  } else if (typeof item.order !== 'number') {
    throw 'Order must be a number';
  }

  return item;
};

// Validate custom section item
const validateCustomItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw 'Custom item must be an object';
  }

  item.title = validateString(item.title, 'Custom section title');
  item.content = validateString(item.content, 'Content');

  if (item.order === undefined) {
    item.order = 0;
  } else if (typeof item.order !== 'number') {
    throw 'Order must be a number';
  }

  return item;
};

// Validate section
const validateSection = (section) => {
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    throw 'Section must be an object';
  }

  section.type = validateSectionType(section.type);

  if (!section._id) {
    section._id = new ObjectId();
  } else {
    section._id = validateObjectId(section._id);
  }

  if (!section.items || !Array.isArray(section.items)) {
    throw 'Section must have an items array';
  }

  // Validate items based on section type
  switch (section.type) {
    case 'education':
      section.items = section.items.map(validateEducationItem);
      break;
    case 'work':
      section.items = section.items.map(validateWorkItem);
      break;
    case 'certification':
      section.items = section.items.map(validateCertificationItem);
      break;
    case 'project':
      section.items = section.items.map(validateProjectItem);
      break;
    case 'custom':
      section.items = section.items.map(validateCustomItem);
      break;
    default:
      throw `Invalid section type: ${section.type}`;
  }

  return section;
};

// Validate layout
const validateLayout = (layout) => {
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) {
    throw 'Layout must be an object';
  }

  if (typeof layout.singlePage !== 'boolean') {
    throw 'Layout must specify singlePage as a boolean';
  }

  if (!layout.singlePage) {
    if (!layout.pages || !Array.isArray(layout.pages)) {
      throw 'Multi-page layout must have a pages array';
    }

    layout.pages = layout.pages.map((page) => {
      if (!page || typeof page !== 'object' || Array.isArray(page)) {
        throw 'Page must be an object';
      }

      page.title = validateString(page.title, 'Page title');

      if (!page.sectionIds || !Array.isArray(page.sectionIds)) {
        throw 'Page must have a sectionIds array';
      }

      page.sectionIds = page.sectionIds.map((id) => validateObjectId(id));

      return page;
    });
  } else {
    // For single page layout, ensure pages is an empty array
    layout.pages = [];
  }

  return layout;
};

// Create a new portfolio
export const createPortfolio = async (
  ownerId,
  title,
  description,
  sections = [],
  layout = { singlePage: true, pages: [] },
  themeId,
  contactButtonEnabled = false,
  contactEmail = null,
  isExample = false,
  copiedFromPortfolioId = null
) => {
  ownerId = validateObjectId(ownerId);
  title = validateTitle(title);
  description = validateDescription(description);
  themeId = validateObjectId(themeId);
  contactButtonEnabled = validateBoolean(contactButtonEnabled, 'Contact button enabled');

  if (contactButtonEnabled && contactEmail) {
    contactEmail = validateEmail(contactEmail);
  } else if (contactButtonEnabled) {
    // If contact is enabled but no email provided, get user's email
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ownerId });
    if (!user) throw 'Owner not found';
    contactEmail = user.email;
  }

  // Validate theme exists
  const themeCollection = await themes();
  const theme = await themeCollection.findOne({ _id: themeId });
  if (!theme) throw 'Theme not found';

  // Validate sections
  sections = sections.map(validateSection);

  // Validate layout
  layout = validateLayout(layout);

  // Validate isExample
  isExample = validateBoolean(isExample, 'Is example');

  // Validate copiedFromPortfolioId if provided
  if (copiedFromPortfolioId !== null) {
    copiedFromPortfolioId = validateObjectId(copiedFromPortfolioId);

    // Verify the source portfolio exists
    const sourcePortfolio = await getPortfolioById(copiedFromPortfolioId);
    if (!sourcePortfolio) throw 'Source portfolio not found';
  }

  // Create the new portfolio
  const newPortfolio = {
    ownerId,
    title,
    description,
    sections,
    layout,
    themeId,
    contactButtonEnabled,
    contactEmail,
    isExample,
    copiedFromPortfolioId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert the new portfolio
  const portfolioCollection = await portfolios();
  const insertInfo = await portfolioCollection.insertOne(newPortfolio);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add portfolio';
  }

  // If this is the user's first portfolio, set it as active
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: ownerId });
  if (user && !user.activePortfolioId) {
    await userCollection.updateOne(
      { _id: ownerId },
      { $set: { activePortfolioId: insertInfo.insertedId } }
    );
  }

  // Return the new portfolio
  return await getPortfolioById(insertInfo.insertedId.toString());
};

// Get a portfolio by ID
export const getPortfolioById = async (portfolioId) => {
  portfolioId = validateObjectId(portfolioId);
  const portfolioCollection = await portfolios();
  const portfolio = await portfolioCollection.findOne({ _id: portfolioId });
  if (!portfolio) throw 'Portfolio not found';
  return portfolio;
};

// Get all portfolios for a user
export const getPortfoliosByUserId = async (userId) => {
  userId = validateObjectId(userId);
  const portfolioCollection = await portfolios();
  const portfolioList = await portfolioCollection.find({ ownerId: userId }).toArray();
  return portfolioList;
};

// Get all example portfolios
export const getExamplePortfolios = async () => {
  const portfolioCollection = await portfolios();
  const portfolioList = await portfolioCollection.find({ isExample: true }).toArray();
  return portfolioList;
};

// Update a portfolio
export const updatePortfolio = async (
  portfolioId,
  title,
  description,
  sections,
  layout,
  themeId,
  contactButtonEnabled,
  contactEmail
) => {
  portfolioId = validateObjectId(portfolioId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  title = validateTitle(title);
  description = validateDescription(description);
  themeId = validateObjectId(themeId);
  contactButtonEnabled = validateBoolean(contactButtonEnabled, 'Contact button enabled');

  if (contactButtonEnabled && contactEmail) {
    contactEmail = validateEmail(contactEmail);
  } else if (contactButtonEnabled) {
    // If contact is enabled but no email provided, get user's email
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: existingPortfolio.ownerId });
    if (!user) throw 'Owner not found';
    contactEmail = user.email;
  }

  // Validate theme exists
  const themeCollection = await themes();
  const theme = await themeCollection.findOne({ _id: themeId });
  if (!theme) throw 'Theme not found';

  // Validate sections
  sections = sections.map(validateSection);

  // Validate layout
  layout = validateLayout(layout);

  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId },
    { 
      $set: { 
        title,
        description,
        sections,
        layout,
        themeId,
        contactButtonEnabled,
        contactEmail,
        updatedAt: new Date()
      } 
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update portfolio';
  return await getPortfolioById(portfolioId);
};

// Delete a portfolio
export const removePortfolio = async (portfolioId) => {
  portfolioId = validateObjectId(portfolioId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow deleting example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot delete example portfolios';
  }

  const portfolioCollection = await portfolios();
  const deletionInfo = await portfolioCollection.deleteOne({ _id: portfolioId });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete portfolio';

  // If this was the user's active portfolio, set activePortfolioId to null
  const userCollection = await users();
  await userCollection.updateOne(
    { activePortfolioId: portfolioId },
    { $set: { activePortfolioId: null } }
  );

  return { portfolioId: portfolioId.toString(), deleted: true };
};

// Clone a portfolio
export const clonePortfolio = async (portfolioId, ownerId, newTitle = null) => {
  portfolioId = validateObjectId(portfolioId);
  ownerId = validateObjectId(ownerId);

  // Get the portfolio to clone
  const portfolioToClone = await getPortfolioById(portfolioId);

  // Set the new title or use the original with " (Copy)" appended
  const title = newTitle ? validateTitle(newTitle) : `${portfolioToClone.title} (Copy)`;

  // Create a new portfolio based on the cloned one
  return await createPortfolio(
    ownerId,
    title,
    portfolioToClone.description,
    portfolioToClone.sections,
    portfolioToClone.layout,
    portfolioToClone.themeId,
    portfolioToClone.contactButtonEnabled,
    portfolioToClone.contactEmail,
    false, // Not an example
    portfolioId // Reference to the source portfolio
  );
};

// Add a section to a portfolio
export const addSection = async (portfolioId, sectionType) => {
  portfolioId = validateObjectId(portfolioId);
  sectionType = validateSectionType(sectionType);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  // Create a new empty section
  const newSection = {
    _id: new ObjectId(),
    type: sectionType,
    items: []
  };

  // Add the section to the portfolio
  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId },
    { 
      $push: { sections: newSection },
      $set: { updatedAt: new Date() }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not add section';
  return await getPortfolioById(portfolioId);
};

// Remove a section from a portfolio
export const removeSection = async (portfolioId, sectionId) => {
  portfolioId = validateObjectId(portfolioId);
  sectionId = validateObjectId(sectionId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  // Remove the section from the portfolio
  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId },
    { 
      $pull: { sections: { _id: sectionId } },
      $set: { updatedAt: new Date() }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not remove section';

  // Also remove the section from any pages in the layout
  if (!existingPortfolio.layout.singlePage) {
    const updatedPages = existingPortfolio.layout.pages.map(page => {
      return {
        ...page,
        sectionIds: page.sectionIds.filter(id => !id.equals(sectionId))
      };
    });

    const portfolioCollection = await portfolios();
    await portfolioCollection.updateOne(
      { _id: portfolioId },
      { $set: { 'layout.pages': updatedPages } }
    );
  }

  return await getPortfolioById(portfolioId);
};

// Add an item to a section
export const addSectionItem = async (portfolioId, sectionId, item) => {
  portfolioId = validateObjectId(portfolioId);
  sectionId = validateObjectId(sectionId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  // Find the section
  const section = existingPortfolio.sections.find(s => s._id.toString() === sectionId.toString());
  if (!section) throw 'Section not found';

  // Validate the item based on section type
  let validatedItem;
  switch (section.type) {
    case 'education':
      validatedItem = validateEducationItem(item);
      break;
    case 'work':
      validatedItem = validateWorkItem(item);
      break;
    case 'certification':
      validatedItem = validateCertificationItem(item);
      break;
    case 'project':
      validatedItem = validateProjectItem(item);
      break;
    case 'custom':
      validatedItem = validateCustomItem(item);
      break;
    default:
      throw `Invalid section type: ${section.type}`;
  }

  // Add _id to the item
  validatedItem._id = new ObjectId();

  // Add the item to the section
  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId, 'sections._id': sectionId },
    { 
      $push: { 'sections.$.items': validatedItem },
      $set: { updatedAt: new Date() }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not add item to section';
  return await getPortfolioById(portfolioId);
};

// Update an item in a section
export const updateSectionItem = async (portfolioId, sectionId, itemId, updatedItem) => {
  portfolioId = validateObjectId(portfolioId);
  sectionId = validateObjectId(sectionId);
  itemId = validateObjectId(itemId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  // Find the section
  const section = existingPortfolio.sections.find(s => s._id.toString() === sectionId.toString());
  if (!section) throw 'Section not found';

  // Find the item
  const itemIndex = section.items.findIndex(i => i._id.toString() === itemId.toString());
  if (itemIndex === -1) throw 'Item not found';

  // Validate the updated item based on section type
  let validatedItem;
  switch (section.type) {
    case 'education':
      validatedItem = validateEducationItem(updatedItem);
      break;
    case 'work':
      validatedItem = validateWorkItem(updatedItem);
      break;
    case 'certification':
      validatedItem = validateCertificationItem(updatedItem);
      break;
    case 'project':
      validatedItem = validateProjectItem(updatedItem);
      break;
    case 'custom':
      validatedItem = validateCustomItem(updatedItem);
      break;
    default:
      throw `Invalid section type: ${section.type}`;
  }

  // Preserve the original _id
  validatedItem._id = itemId;

  // Update the item in the section
  const updatePath = `sections.${existingPortfolio.sections.findIndex(s => s._id.toString() === sectionId.toString())}.items.${itemIndex}`;
  const updateObj = {};
  updateObj[updatePath] = validatedItem;

  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId },
    { 
      $set: {
        ...updateObj,
        updatedAt: new Date()
      }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update item';
  return await getPortfolioById(portfolioId);
};

// Remove an item from a section
export const removeSectionItem = async (portfolioId, sectionId, itemId) => {
  portfolioId = validateObjectId(portfolioId);
  sectionId = validateObjectId(sectionId);
  itemId = validateObjectId(itemId);

  // Get the existing portfolio
  const existingPortfolio = await getPortfolioById(portfolioId);

  // Don't allow updating example portfolios
  if (existingPortfolio.isExample) {
    throw 'Cannot update example portfolios';
  }

  // Remove the item from the section
  const portfolioCollection = await portfolios();
  const updateInfo = await portfolioCollection.updateOne(
    { _id: portfolioId, 'sections._id': sectionId },
    { 
      $pull: { 'sections.$.items': { _id: itemId } },
      $set: { updatedAt: new Date() }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not remove item from section';
  return await getPortfolioById(portfolioId);
};
