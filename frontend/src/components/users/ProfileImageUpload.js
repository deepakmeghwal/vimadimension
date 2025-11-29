import React, { useState, useRef, useCallback } from 'react';
import { apiUploadFileWithProgress, getApiUrl, apiGet, apiPost, uploadFileToS3 } from '../../utils/api';

/**
 * ProfileImageUpload Component
 * 
 * A reusable component for uploading profile images with:
 * - Drag and drop support
 * - Click to upload
 * - Image preview
 * - Upload progress
 * - File validation
 * - Delete functionality
 * 
 * Props:
 * - currentImageUrl: Current profile image URL (optional)
 * - onUploadSuccess: Callback when upload succeeds (receives new image URL)
 * - onUploadError: Callback when upload fails (receives error message)
 * - onDelete: Callback when image is deleted
 * - maxSizeMB: Maximum file size in MB (default: 2)
 * - acceptedTypes: Array of accepted MIME types
 */
const ProfileImageUpload = ({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  onDelete,
  maxSizeMB = 2,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file before upload
  const validateFile = (file) => {
    if (!file) {
      return 'No file selected';
    }

    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  // Handle file selection
  const handleFile = useCallback(async (file) => {
    setError('');

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    // Upload the file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Try to get presigned URL
      let usePresigned = false;
      let presignedData = null;

      try {
        const presignedResponse = await apiGet(`/api/profile/presigned-upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);

        if (presignedResponse.ok) {
          presignedData = await presignedResponse.json();
          usePresigned = true;
        } else if (presignedResponse.status === 501) {
          // Not implemented (e.g., Local storage), fall back to legacy upload
          usePresigned = false;
        } else {
          const errorData = await presignedResponse.json();
          throw new Error(errorData.error || 'Failed to initialize upload');
        }
      } catch (err) {
        // If specific error from backend, rethrow. If network/other, maybe fallback?
        // For now, if it's not 501, we treat it as error.
        if (err.message !== 'Failed to fetch') { // simplistic check
          throw err;
        }
      }

      if (usePresigned && presignedData) {
        // 2. Upload directly to S3
        await uploadFileToS3(
          presignedData.uploadUrl,
          file,
          file.type,
          (progress) => setUploadProgress(progress)
        );

        // 3. Confirm success with backend
        const confirmResponse = await apiPost('/api/profile/image-success', {
          fileUrl: presignedData.fileUrl
        });

        const data = await confirmResponse.json();

        if (data.success) {
          if (onUploadSuccess) onUploadSuccess(data.imageUrl);
          setPreviewUrl(null); // Clear preview, use actual URL
        } else {
          throw new Error(data.error || 'Failed to update profile image');
        }

      } else {
        // Fallback: Legacy upload through backend
        const response = await apiUploadFileWithProgress(
          '/api/profile/upload-image',
          file,
          (progress) => setUploadProgress(progress)
        );

        if (response.success) {
          if (onUploadSuccess) onUploadSuccess(response.imageUrl);
          setPreviewUrl(null);
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      }

    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.error || err.message || 'Failed to upload image';
      setError(errorMsg);
      setPreviewUrl(null);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [acceptedTypes, maxSizeBytes, maxSizeMB, onUploadSuccess, onUploadError]);

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle click to upload
  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/profile/delete-image'), {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        if (onDelete) onDelete();
      } else {
        throw new Error(data.error || 'Failed to delete image');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete image';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    }
  };

  // Get the display image URL (preview takes precedence during upload)
  const displayImageUrl = previewUrl || currentImageUrl;
  const hasImage = !!displayImageUrl;

  return (
    <div className="profile-image-upload">
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''} ${hasImage ? 'has-image' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {hasImage ? (
          <div className="image-preview-container">
            <img
              src={displayImageUrl}
              alt="Profile"
              className="profile-image-preview"
            />
            {!isUploading && (
              <div className="image-overlay">
                <div className="overlay-actions">
                  <span className="overlay-text">Click to change</span>
                  <button
                    className="delete-btn"
                    onClick={handleDelete}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="upload-text">
              <span className="upload-main-text">
                {isDragOver ? 'Drop image here' : 'Click or drag to upload'}
              </span>
              <span className="upload-sub-text">
                JPEG, PNG, GIF, WebP • Max {maxSizeMB}MB
              </span>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="upload-progress-overlay">
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;







