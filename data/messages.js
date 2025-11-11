import { ObjectId } from 'mongodb';
import { messages } from '../config/mongoCollections.js';
import { portfolios } from '../config/mongoCollections.js';
import { 
  validateString, 
  validateObjectId, 
  validateEmail
} from '../helpers.js';

// Validate sender name
const validateSenderName = (name) => {
  name = validateString(name, 'Sender name');
  if (name.length < 2) throw 'Sender name must be at least 2 characters long';
  return name;
};

// Validate message content
const validateMessageContent = (message) => {
  message = validateString(message, 'Message');
  if (message.length < 10) throw 'Message must be at least 10 characters long';
  return message;
};

// Create a new message
export const createMessage = async (portfolioId, senderName, senderEmail, message) => {
  portfolioId = validateObjectId(portfolioId);
  senderName = validateSenderName(senderName);
  senderEmail = validateEmail(senderEmail);
  message = validateMessageContent(message);

  // Verify that the portfolio exists
  const portfolioCollection = await portfolios();
  const portfolio = await portfolioCollection.findOne({ _id: portfolioId });
  if (!portfolio) throw 'Portfolio not found';
  
  // Verify that the portfolio has contact enabled
  if (!portfolio.contactButtonEnabled) throw 'Contact is not enabled for this portfolio';

  // Create the new message
  const newMessage = {
    portfolioId,
    senderName,
    senderEmail,
    message,
    sentAt: new Date()
  };

  // Insert the new message
  const messageCollection = await messages();
  const insertInfo = await messageCollection.insertOne(newMessage);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not add message';
  }

  // Return the new message
  return await getMessageById(insertInfo.insertedId.toString());
};

// Get a message by ID
export const getMessageById = async (messageId) => {
  messageId = validateObjectId(messageId);
  const messageCollection = await messages();
  const message = await messageCollection.findOne({ _id: messageId });
  if (!message) throw 'Message not found';
  return message;
};

// Get all messages for a portfolio
export const getMessagesByPortfolioId = async (portfolioId) => {
  portfolioId = validateObjectId(portfolioId);
  const messageCollection = await messages();
  const messageList = await messageCollection.find({ portfolioId }).toArray();
  return messageList;
};

// Get all messages for a user (by checking all their portfolios)
export const getMessagesByUserId = async (userId) => {
  userId = validateObjectId(userId);
  
  // Get all portfolios for the user
  const portfolioCollection = await portfolios();
  const userPortfolios = await portfolioCollection.find({ ownerId: userId }).toArray();
  
  if (userPortfolios.length === 0) return [];
  
  // Get all portfolio IDs
  const portfolioIds = userPortfolios.map(portfolio => portfolio._id);
  
  // Get all messages for these portfolios
  const messageCollection = await messages();
  const messageList = await messageCollection.find({ 
    portfolioId: { $in: portfolioIds } 
  }).toArray();
  
  return messageList;
};

// Delete a message
export const removeMessage = async (messageId) => {
  messageId = validateObjectId(messageId);
  const messageCollection = await messages();
  const deletionInfo = await messageCollection.deleteOne({ _id: messageId });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete message';
  return { messageId: messageId.toString(), deleted: true };
};

// Delete all messages for a portfolio
export const removeMessagesByPortfolioId = async (portfolioId) => {
  portfolioId = validateObjectId(portfolioId);
  const messageCollection = await messages();
  const deletionInfo = await messageCollection.deleteMany({ portfolioId });
  return { 
    portfolioId: portfolioId.toString(), 
    deletedCount: deletionInfo.deletedCount 
  };
};