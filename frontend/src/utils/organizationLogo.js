/**
 * Utility functions for organization logo display
 */

/**
 * Generate initials from organization name
 * @param {string} name - Organization name
 * @returns {string} Initials (max 2 characters)
 */
export const getOrganizationInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '??';
  }

  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    // Single word: take first 2 characters
    return name.substring(0, 2).toUpperCase();
  }

  // Multiple words: take first letter of first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

/**
 * Get organization logo URL or return null
 * @param {string|null|undefined} logoUrl - Organization logo URL
 * @returns {string|null} Logo URL or null
 */
export const getOrganizationLogoUrl = (logoUrl) => {
  if (!logoUrl || typeof logoUrl !== 'string' || logoUrl.trim() === '') {
    return null;
  }
  return logoUrl;
};

/**
 * Component props for organization logo display
 * @param {string|null} logoUrl - Organization logo URL
 * @param {string} name - Organization name
 * @param {string} className - CSS class name
 * @param {object} style - Inline styles
 * @returns {object} Props for logo display
 */
export const getOrganizationLogoProps = (logoUrl, name, className = '', style = {}) => {
  const url = getOrganizationLogoUrl(logoUrl);
  const initials = getOrganizationInitials(name);

  return {
    logoUrl: url,
    initials,
    hasLogo: !!url,
    className,
    style
  };
};






