package org.example.service;

/**
 * Helper class for building consistent S3/file storage paths.
 * 
 * This ensures all files follow a consistent, scalable structure:
 * 
 * Structure:
 *   {fileType}/{organizationId}/{optionalSubPath}/{filename}
 * 
 * Examples:
 *   - Profile images: profile-images/{orgId}/user_{userId}_{uuid}.png
 *   - Documents: documents/{orgId}/{category}/{userId}_{uuid}.pdf
 *   - Project files: project-files/{orgId}/project_{projectId}/{userId}_{uuid}.{ext}
 * 
 * Benefits:
 *   - Easy to find files by organization
 *   - Scalable (can add new file types easily)
 *   - Supports lifecycle policies per prefix
 *   - Clear organization for auditing
 */
public class FileStoragePathBuilder {

    // File type constants
    public static final String PROFILE_IMAGES = "profile-images";
    public static final String DOCUMENTS = "documents";
    public static final String PROJECT_FILES = "project-files";
    public static final String TEMP_UPLOADS = "temp-uploads";
    public static final String ORGANIZATION_LOGOS = "organization-logos";

    /**
     * Build path for profile image.
     * Format: profile-images/{orgId}/user_{userId}_{uuid}.{ext}
     */
    public static String buildProfileImagePath(Long organizationId, Long userId, String uuid, String extension) {
        return String.format("%s/%d/user_%d_%s%s", 
            PROFILE_IMAGES, organizationId, userId, uuid, extension);
    }

    /**
     * Build path for document.
     * Format: documents/{orgId}/{category}/{userId}_{uuid}.{ext}
     * 
     * @param category Document category (e.g., "invoices", "contracts", "reports")
     */
    public static String buildDocumentPath(Long organizationId, String category, Long userId, String uuid, String extension) {
        return String.format("%s/%d/%s/%d_%s%s", 
            DOCUMENTS, organizationId, category, userId, uuid, extension);
    }

    /**
     * Build path for project file.
     * Format: project-files/{orgId}/project_{projectId}/{userId}_{uuid}.{ext}
     */
    public static String buildProjectFilePath(Long organizationId, Long projectId, Long userId, String uuid, String extension) {
        return String.format("%s/%d/project_%d/%d_%s%s", 
            PROJECT_FILES, organizationId, projectId, userId, uuid, extension);
    }

    /**
     * Build path for temporary upload (will be moved to final location after processing).
     * Format: temp-uploads/{orgId}/{uuid}.{ext}
     */
    public static String buildTempUploadPath(Long organizationId, String uuid, String extension) {
        return String.format("%s/%d/%s%s", 
            TEMP_UPLOADS, organizationId, uuid, extension);
    }

    /**
     * Extract file type from a storage path.
     * Example: "profile-images/2/user_4_abc.png" -> "profile-images"
     */
    public static String extractFileType(String storagePath) {
        if (storagePath == null || storagePath.isEmpty()) {
            return null;
        }
        int firstSlash = storagePath.indexOf('/');
        if (firstSlash > 0) {
            return storagePath.substring(0, firstSlash);
        }
        return storagePath;
    }

    /**
     * Extract organization ID from a storage path.
     * Example: "profile-images/2/user_4_abc.png" -> 2
     */
    public static Long extractOrganizationId(String storagePath) {
        if (storagePath == null || storagePath.isEmpty()) {
            return null;
        }
        String[] parts = storagePath.split("/");
        if (parts.length >= 2) {
            try {
                return Long.parseLong(parts[1]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}


