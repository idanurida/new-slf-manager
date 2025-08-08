// server/src/utils/helpers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate unique ID
 * @returns {string}
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format date to ISO string
 * @param {Date} date 
 * @returns {string}
 */
const formatDateISO = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Calculate age from date of birth
 * @param {string|Date} dob 
 * @returns {number}
 */
const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone 
 * @returns {boolean}
 */
const validatePhone = (phone) => {
  const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return re.test(String(phone).replace(/\s+/g, ''));
};

/**
 * Format currency to IDR
 * @param {number} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate random password
 * @param {number} length 
 * @returns {string}
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

/**
 * Mask sensitive data (e.g., phone number, email)
 * @param {string} data 
 * @param {string} type 
 * @returns {string}
 */
const maskData = (data, type) => {
  if (!data) return '';
  
  switch (type) {
    case 'phone':
      // Mask phone number, show last 4 digits
      return data.replace(/.(?=.{4})/g, '*');
    case 'email':
      // Mask email, show first and last character before @
      const [name, domain] = data.split('@');
      if (name.length <= 2) {
        return `*${name.slice(-1)}@${domain}`;
      }
      return `${name[0]}***${name.slice(-1)}@${domain}`;
    default:
      // Mask all but last 4 characters
      return data.replace(/.(?=.{4})/g, '*');
  }
};

/**
 * Check if object is empty
 * @param {object} obj 
 * @returns {boolean}
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Deep clone object
 * @param {object} obj 
 * @returns {object}
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Paginate array
 * @param {Array} array 
 * @param {number} page 
 * @param {number} limit 
 * @returns {object}
 */
const paginateArray = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit
    }
  };
};

/**
 * Sleep function for async operations
 * @param {number} ms 
 * @returns {Promise}
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate JWT token
 * @param {number} userId 
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {object}
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Hash password
 * @param {string} password 
 * @returns {string}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {boolean}
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Ensure directory exists
 * @param {string} dirPath 
 * @returns {Promise<void>}
 */
const ensureDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Delete file
 * @param {string} filePath 
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Move file
 * @param {string} oldPath 
 * @param {string} newPath 
 * @returns {Promise<void>}
 */
const moveFile = async (oldPath, newPath) => {
  await fs.rename(oldPath, newPath);
};

/**
 * Copy file
 * @param {string} sourcePath 
 * @param {string} destPath 
 * @returns {Promise<void>}
 */
const copyFile = async (sourcePath, destPath) => {
  await fs.copyFile(sourcePath, destPath);
};

/**
 * Get file extension
 * @param {string} filename 
 * @returns {string}
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Generate random string
 * @param {number} length 
 * @returns {string}
 */
const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate file type
 * @param {string} mimeType 
 * @param {Array} allowedTypes 
 * @returns {boolean}
 */
const validateFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Format phone number to Indonesian format
 * @param {string} phone 
 * @returns {string}
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Handle international format
  if (cleanPhone.startsWith('+62')) {
    cleanPhone = '0' + cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('62')) {
    cleanPhone = '0' + cleanPhone.substring(2);
  }
  
  return cleanPhone;
};

module.exports = {
  generateId,
  formatDateISO,
  calculateAge,
  validateEmail,
  validatePhone,
  formatCurrency,
  formatBytes,
  generateRandomPassword,
  maskData,
  isEmpty,
  deepClone,
  paginateArray,
  sleep,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  ensureDirectory,
  deleteFile,
  moveFile,
  copyFile,
  getFileExtension,
  generateRandomString,
  validateFileType,
  formatPhoneNumber
};