/**
 * Shared Validation Utilities for Multi-System Government Platform
 * Used across: National ID System, National Health System, Police System
 */

// Text validation - only letters, spaces, and common punctuation
const validateText = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and periods
  const textRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\s\-'\.]+$/;
  if (!textRegex.test(value)) {
    return { isValid: false, error: `${fieldName} should only contain letters` };
  }
  
  if (value.length > 200) {
    return { isValid: false, error: `${fieldName} is too long (max 200 characters)` };
  }
  
  return { isValid: true };
};

// Numeric validation - only digits
const validateNumeric = (value, fieldName, minLength = 1, maxLength = 20) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const numericRegex = /^\d+$/;
  if (!numericRegex.test(value)) {
    return { isValid: false, error: `${fieldName} should only contain numbers` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} digits` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be at most ${maxLength} digits` };
  }
  
  return { isValid: true };
};

// Phone number validation
const validatePhone = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  // Allow + followed by digits, spaces, hyphens
  const phoneRegex = /^\+?[\d\s\-]+$/;
  if (!phoneRegex.test(value)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }
  
  // Remove non-digit characters for length check
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return { isValid: false, error: `${fieldName} must be between 8-15 digits` };
  }
  
  return { isValid: true };
};

// Email validation
const validateEmail = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }
  
  if (value.length > 120) {
    return { isValid: false, error: `${fieldName} is too long` };
  }
  
  return { isValid: true };
};

// Date validation
const validateDate = (value, fieldName, allowFuture = false, allowPast = true) => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }
  
  const now = new Date();
  
  if (!allowFuture && date > now) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  
  if (!allowPast && date < now) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  
  return { isValid: true };
};

// National ID validation (11 digits for Somalia)
const validateNationalID = (value) => {
  return validateNumeric(value, 'National ID Number', 11, 11);
};

// Passport number validation
const validatePassportNumber = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Passport number is required' };
  }
  
  // Allow letters and numbers
  const passportRegex = /^[A-Za-z0-9]+$/;
  if (!passportRegex.test(value)) {
    return { isValid: false, error: 'Passport number should only contain letters and numbers' };
  }
  
  if (value.length < 6 || value.length > 15) {
    return { isValid: false, error: 'Passport number must be between 6-15 characters' };
  }
  
  return { isValid: true };
};

// Required field validation
const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Validate form object
const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule(value, field);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors };
};

module.exports = {
  validateText,
  validateNumeric,
  validatePhone,
  validateEmail,
  validateDate,
  validateNationalID,
  validatePassportNumber,
  validateRequired,
  validateForm
};
