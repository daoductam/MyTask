/**
 * Formats a date string into DD/MM/YYYY format.
 * This ensures consistency across all components and locales.
 * @param {string|Date} dateSource - The date string or Date object to format.
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (dateSource) => {
  if (!dateSource) return 'N/A';
  
  try {
    const date = new Date(dateSource);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Specifically handles ISO strings from the backend to avoid timezone shifts.
 * Use this when the date string is YYYY-MM-DD.
 * @param {string} dateString - YYYY-MM-DD string
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatDateStrict = (dateString) => {
  if (!dateString) return 'N/A';
  
  // If it's already in YYYY-MM-DD format, we can split it to avoid timezone issues
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
  }
  
  return formatDate(dateString);
};
