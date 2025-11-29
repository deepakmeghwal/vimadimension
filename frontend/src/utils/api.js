/**
 * API Utility - Centralized API configuration
 * 
 * Uses REACT_APP_API_URL environment variable for API base URL.
 * If not set, defaults to relative path (works when frontend and backend are on same domain).
 * 
 * For S3 + CloudFront deployment:
 * - Set REACT_APP_API_URL=https://api.yourdomain.com in build environment
 * - Or set it in your CI/CD pipeline
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if present (we'll add it)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If API_BASE_URL is set, use it; otherwise use relative path
  if (API_BASE_URL) {
    // Remove trailing slash from base URL if present
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanEndpoint}`;
  }

  // Default to relative path (works for same-domain deployments)
  return cleanEndpoint;
};

/**
 * Fetch wrapper for API calls with automatic URL handling and credentials
 * @param {string} endpoint - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);

  const defaultOptions = {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};

/**
 * GET request helper
 */
export const apiGet = (endpoint, options = {}) => {
  return apiFetch(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 */
export const apiPost = (endpoint, data, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const apiPut = (endpoint, data, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiFetch(endpoint, { ...options, method: 'DELETE' });
};

/**
 * Form URL-encoded POST helper (for form submissions)
 */
export const apiPostForm = (endpoint, formData, options = {}) => {
  const url = getApiUrl(endpoint);

  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
    body: formData instanceof URLSearchParams ? formData.toString() : formData,
    ...options,
  });
};

/**
 * File upload helper using FormData (for multipart/form-data uploads)
 * @param {string} endpoint - API endpoint
 * @param {File} file - The file to upload
 * @param {string} fieldName - The form field name (default: 'file')
 * @param {Object} additionalData - Additional form fields to include
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const apiUploadFile = async (endpoint, file, fieldName = 'file', additionalData = {}, options = {}) => {
  const url = getApiUrl(endpoint);
  const formData = new FormData();

  // Append the file
  formData.append(fieldName, file);

  // Append any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Note: Don't set Content-Type header - browser will set it with boundary
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });
};

/**
 * File upload with progress tracking
 * @param {string} endpoint - API endpoint
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (receives percentage 0-100)
 * @param {string} fieldName - The form field name (default: 'file')
 * @returns {Promise<Object>} Response JSON
 */
export const apiUploadFileWithProgress = (endpoint, file, onProgress, fieldName = 'file') => {
  return new Promise((resolve, reject) => {
    const url = getApiUrl(endpoint);
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append(fieldName, file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        console.log('Upload response status:', xhr.status);
        console.log('Upload response headers:', xhr.getAllResponseHeaders());
        console.log('Upload response body:', xhr.responseText);

        if (!xhr.responseText || xhr.responseText.trim() === '') {
          reject({ error: 'Empty response from server' });
          return;
        }

        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(response);
        }
      } catch (e) {
        console.error('Failed to parse response:', e);
        console.error('Raw response:', xhr.responseText);
        reject({ error: 'Failed to parse response: ' + (xhr.responseText || 'empty').substring(0, 100) });
      }
    });

    xhr.addEventListener('error', () => {
      reject({ error: 'Upload failed' });
    });

    xhr.addEventListener('abort', () => {
      reject({ error: 'Upload cancelled' });
    });

    xhr.open('POST', url);
    xhr.withCredentials = true; // Include cookies
    xhr.send(formData);
  });
};

/**
 * Upload file directly to S3 using a presigned URL
 * @param {string} presignedUrl - The presigned upload URL
 * @param {File} file - The file to upload
 * @param {string} contentType - The content type of the file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<void>}
 */
export const uploadFileToS3 = (presignedUrl, file, contentType, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject({ error: `S3 upload failed with status ${xhr.status}` });
      }
    });

    xhr.addEventListener('error', () => {
      reject({ error: 'S3 upload failed' });
    });

    xhr.addEventListener('abort', () => {
      reject({ error: 'S3 upload cancelled' });
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    // No credentials for S3 presigned URL (everything is in the URL)
    xhr.send(file);
  });
};

export default {
  getApiUrl,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPostForm,
  apiUploadFile,
  apiUploadFileWithProgress,
  uploadFileToS3,
};

