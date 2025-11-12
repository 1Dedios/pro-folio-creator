import {ObjectId} from 'mongodb';

// String validation
export const validateString = (str, paramName) => {
  if (!str) throw `${paramName || 'String parameter'} must be provided`;
  if (typeof str !== 'string') throw `${paramName || 'Parameter'} must be a string`;
  str = str.trim();
  if (str.length === 0) throw `${paramName || 'String parameter'} cannot be empty or just spaces`;
  return str;
};

// ObjectId validation
export const validateObjectId = (id, paramName) => {
  if (!id) throw `${paramName || 'Id'} must be provided`;
  if (typeof id === 'string') {
    id = id.trim();
    if (id.length === 0) throw `${paramName || 'Id'} cannot be empty or just spaces`;
    if (!ObjectId.isValid(id)) throw `${paramName || 'Id'} is not a valid ObjectId`;
    return new ObjectId(id);
  }
  if (!ObjectId.isValid(id)) throw `${paramName || 'Id'} is not a valid ObjectId`;
  return id;
};

// Date validation
export const validateDate = (date, paramName) => {
  if (!date) throw `${paramName || 'Date'} must be provided`;
  if (typeof date !== 'string') throw `${paramName || 'Date'} must be a string`;
  date = date.trim();
  if (date.length === 0) throw `${paramName || 'Date'} cannot be empty or just spaces`;
  
  // Check if date is in MM/DD/YYYY format
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dateRegex.test(date)) throw `${paramName || 'Date'} must be in MM/DD/YYYY format`;
  
  // Check if date is valid
  const [month, day, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    throw `${paramName || 'Date'} is not a valid date`;
  }
  
  return date;
};

// Array validation
export const validateArray = (arr, paramName, validateFn) => {
  if (!arr) throw `${paramName || 'Array'} must be provided`;
  if (!Array.isArray(arr)) throw `${paramName || 'Parameter'} must be an array`;
  if (arr.length === 0) throw `${paramName || 'Array'} cannot be empty`;
  
  if (validateFn) {
    return arr.map(item => validateFn(item));
  }
  
  return arr;
};

// Email validation
export const validateEmail = (email, paramName) => {
  email = validateString(email, paramName || 'Email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw `${paramName || 'Email'} is not a valid email address`;
  return email;
};

// Password validation
export const validatePassword = (password, paramName) => {
  password = validateString(password, paramName || 'Password');
  if (password.length < 8) throw `${paramName || 'Password'} must be at least 8 characters long`;
  // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw `${paramName || 'Password'} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`;
  }
  return password;
};

// URL validation
export const validateUrl = (url, paramName) => {
  url = validateString(url, paramName || 'URL');
  try {
    new URL(url);
    return url;
  } catch (e) {
    throw `${paramName || 'URL'} is not a valid URL`;
  }
};

// Boolean validation
export const validateBoolean = (bool, paramName) => {
  if (bool === undefined || bool === null) throw `${paramName || 'Boolean'} must be provided`;
  if (typeof bool !== 'boolean') throw `${paramName || 'Parameter'} must be a boolean`;
  return bool;
};