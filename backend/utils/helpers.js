// utils/helpers.js (ESM version)

// Generate a unique session ID
export const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Simple validation for empty or null values
export const isValidString = (str) => {
  return str && typeof str === 'string' && str.trim().length > 0;
};

// Extract domain from URL
export const extractDomain = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return 'unknown';
  }
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
