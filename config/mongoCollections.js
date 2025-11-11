import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

// Collections for the portfolio creator project
export const users = getCollectionFn('users');
export const messages = getCollectionFn('messages');
export const themes = getCollectionFn('themes');
export const portfolios = getCollectionFn('portfolios');
