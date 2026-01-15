package org.example.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interface for file storage operations.
 * This abstraction allows for easy switching between different storage backends:
 * - Local filesystem (default)
 * - Amazon S3
 * - Azure Blob Storage
 * - Google Cloud Storage
 * 
 * To add a new storage backend, implement this interface and configure the bean.
 */
public interface FileStorageService {

    /**
     * Stores a file and returns the URL/path to access it.
     * 
     * @param file The multipart file to store
     * @param directory The logical directory/folder name (e.g., "profile-images", "documents")
     * @param filename The desired filename (without extension)
     * @return The URL/path to access the stored file
     * @throws FileStorageException if the file cannot be stored
     */
    String storeFile(MultipartFile file, String directory, String filename) throws FileStorageException;

    /**
     * Deletes a file from storage.
     * 
     * @param fileUrl The URL/path of the file to delete
     * @return true if the file was deleted, false if it didn't exist
     * @throws FileStorageException if deletion fails
     */
    boolean deleteFile(String fileUrl) throws FileStorageException;

    /**
     * Checks if a file exists in storage.
     * 
     * @param fileUrl The URL/path of the file
     * @return true if the file exists
     */
    boolean fileExists(String fileUrl);

    /**
     * Gets the bytes of a stored file.
     * 
     * @param fileUrl The URL/path of the file
     * @return The file bytes
     * @throws FileStorageException if the file cannot be read
     */
    byte[] getFileBytes(String fileUrl) throws FileStorageException;

    /**
     * Gets the content type of a stored file.
     * 
     * @param fileUrl The URL/path of the file
     * @return The content type (e.g., "image/jpeg")
     */
    String getContentType(String fileUrl);

    /**
     * Validates that the file meets the requirements.
     * 
     * @param file The file to validate
     * @param allowedTypes Array of allowed MIME types (e.g., "image/jpeg", "image/png")
     * @param maxSizeBytes Maximum allowed file size in bytes
     * @throws FileStorageException if validation fails
     */
    void validateFile(MultipartFile file, String[] allowedTypes, long maxSizeBytes) throws FileStorageException;

    /**
     * Record to hold presigned URL response data.
     */
    record PresignedUrlResponse(String uploadUrl, String fileUrl, String method) {}

    /**
     * Generates a presigned URL for uploading a file directly to storage.
     * 
     * @param directory The logical directory/folder name
     * @param filename The desired filename (without extension)
     * @param contentType The MIME type of the file
     * @return The presigned URL response containing the upload URL and the final file URL
     * @throws FileStorageException if the URL cannot be generated
     */
    default PresignedUrlResponse generatePresignedUploadUrl(String directory, String filename, String contentType) {
        throw new UnsupportedOperationException("Presigned URLs not supported by this storage provider");
    }

    /**
     * Generates a presigned URL for downloading a file directly from storage.
     * 
     * @param fileUrl The URL/path of the file
     * @return The presigned download URL
     * @throws FileStorageException if the URL cannot be generated
     */
    default String generatePresignedDownloadUrl(String fileUrl) {
        throw new UnsupportedOperationException("Presigned URLs not supported by this storage provider");
    }

    /**
     * Custom exception for file storage operations.
     */
    class FileStorageException extends RuntimeException {
        public FileStorageException(String message) {
            super(message);
        }

        public FileStorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}








