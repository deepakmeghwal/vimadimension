package org.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

/**
 * S3 implementation of FileStorageService for production deployments.
 * 
 * This service is automatically activated when app.storage.type=s3
 * 
 * Files are stored in S3 with the following structure:
 *   s3://{bucket}/profile-images/{orgId}/user_{userId}_{uuid}.{ext}
 * 
 * The service uses IAM instance roles for authentication (no credentials needed).
 * 
 * Configuration:
 *   - AWS_S3_BUCKET: The S3 bucket name
 *   - AWS_REGION: The AWS region (e.g., us-east-1)
 *   - APP_STORAGE_TYPE: Set to "s3" to enable this service
 */
@Service
@Primary
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3FileStorageService.class);

    @Value("${AWS_S3_BUCKET:}")
    private String bucketName;

    @Value("${AWS_REGION:us-east-1}")
    private String region;

    @Value("${app.storage.s3.url-expiration-hours:24}")
    private int urlExpirationHours;

    private S3Client s3Client;
    private S3Presigner presigner;

    @PostConstruct
    public void init() {
        if (bucketName == null || bucketName.isEmpty()) {
            logger.error("S3 bucket name not configured! Set AWS_S3_BUCKET environment variable.");
            throw new FileStorageException("S3 bucket name not configured. Set AWS_S3_BUCKET environment variable.");
        }

        try {
            s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .build();
            
            presigner = S3Presigner.builder()
                    .region(Region.of(region))
                    .build();
            
            // Verify bucket exists and we have access
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            logger.info("✓ S3FileStorageService initialized successfully - bucket: {} in region: {}", bucketName, region);
        } catch (NoSuchBucketException e) {
            logger.error("S3 bucket does not exist: {}", bucketName);
            throw new FileStorageException("S3 bucket does not exist: " + bucketName, e);
        } catch (S3Exception e) {
            logger.error("S3 access error: {} - {}", e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            throw new FileStorageException("Failed to access S3 bucket: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            logger.error("Failed to initialize S3 client: {}", e.getMessage(), e);
            throw new FileStorageException("Failed to initialize S3 storage: " + e.getMessage(), e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String directory, String filename) throws FileStorageException {
        try {
            if (file.isEmpty()) {
                throw new FileStorageException("Cannot store empty file");
            }

            // Get file extension from original filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate unique filename with UUID to prevent collisions
            String uniqueFilename = filename + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            // Build the S3 key (path within bucket)
            String s3Key = directory + "/" + uniqueFilename;

            // Determine content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Upload to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            logger.info("Stored file in S3: s3://{}/{}", bucketName, s3Key);

            // Return the S3 URL for accessing the file
            // Using path-style URL that will be served through our backend API
            return "/api/files/" + s3Key;

        } catch (IOException e) {
            throw new FileStorageException("Failed to store file in S3: " + e.getMessage(), e);
        } catch (S3Exception e) {
            throw new FileStorageException("S3 error storing file: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String fileUrl) throws FileStorageException {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return false;
            }

            // Extract S3 key from URL
            String s3Key = extractS3Key(fileUrl);
            if (s3Key == null) {
                return false;
            }

            // Check if object exists
            if (!fileExists(fileUrl)) {
                return false;
            }

            // Delete from S3
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("Deleted file from S3: s3://{}/{}", bucketName, s3Key);
            return true;

        } catch (S3Exception e) {
            throw new FileStorageException("S3 error deleting file: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    @Override
    public boolean fileExists(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return false;
            }

            String s3Key = extractS3Key(fileUrl);
            if (s3Key == null) {
                return false;
            }

            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.headObject(headRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            logger.warn("Error checking if file exists in S3: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public byte[] getFileBytes(String fileUrl) throws FileStorageException {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                throw new FileStorageException("File URL cannot be null or empty");
            }

            String s3Key = extractS3Key(fileUrl);
            if (s3Key == null) {
                throw new FileStorageException("Invalid file URL: " + fileUrl);
            }

            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            return s3Client.getObjectAsBytes(getRequest).asByteArray();

        } catch (NoSuchKeyException e) {
            throw new FileStorageException("File not found in S3: " + fileUrl);
        } catch (S3Exception e) {
            throw new FileStorageException("S3 error reading file: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    @Override
    public String getContentType(String fileUrl) {
        try {
            if (fileUrl == null) {
                return "application/octet-stream";
            }

            String s3Key = extractS3Key(fileUrl);
            if (s3Key == null) {
                return getContentTypeFromExtension(fileUrl);
            }

            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headRequest);
            String contentType = response.contentType();
            
            return contentType != null ? contentType : getContentTypeFromExtension(fileUrl);

        } catch (Exception e) {
            return getContentTypeFromExtension(fileUrl);
        }
    }

    @Override
    public void validateFile(MultipartFile file, String[] allowedTypes, long maxSizeBytes) throws FileStorageException {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("File cannot be empty");
        }

        // Check file size
        if (file.getSize() > maxSizeBytes) {
            throw new FileStorageException(String.format(
                "File size (%d bytes) exceeds maximum allowed size (%d bytes)",
                file.getSize(), maxSizeBytes
            ));
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new FileStorageException("Could not determine file type");
        }

        boolean isAllowed = Arrays.stream(allowedTypes)
            .anyMatch(type -> contentType.equalsIgnoreCase(type));

        if (!isAllowed) {
            throw new FileStorageException(String.format(
                "File type '%s' is not allowed. Allowed types: %s",
                contentType, String.join(", ", allowedTypes)
            ));
        }
    }

    @Override
    public PresignedUrlResponse generatePresignedUploadUrl(String directory, String filename, String contentType) {
        try {
            // Generate unique filename
            String extension = getExtensionFromContentType(contentType);
            String uniqueFilename = filename + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            // Build the S3 key (path within bucket)
            String s3Key = directory + "/" + uniqueFilename;

            // Create the PutObjectRequest
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .build();

            // Create the PresignRequest
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // 10 minutes to upload
                    .putObjectRequest(objectRequest)
                    .build();

            // Generate the presigned URL
            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
            String uploadUrl = presignedRequest.url().toString();
            
            // Return the S3 URL for accessing the file (using our proxy format)
            String fileUrl = "/api/files/" + s3Key;

            return new PresignedUrlResponse(uploadUrl, fileUrl, "PUT");

        } catch (Exception e) {
             throw new FileStorageException("Failed to generate presigned upload URL", e);
        }
    }

    @Override
    public String generatePresignedDownloadUrl(String fileUrl) {
        try {
            String s3Key = extractS3Key(fileUrl);
            if (s3Key == null) {
                throw new FileStorageException("Invalid file URL: " + fileUrl);
            }

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(urlExpirationHours))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();

        } catch (Exception e) {
            throw new FileStorageException("Failed to generate presigned download URL", e);
        }
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) return "";
        switch (contentType.toLowerCase()) {
            case "image/jpeg": return ".jpg";
            case "image/png": return ".png";
            case "image/gif": return ".gif";
            case "image/webp": return ".webp";
            case "image/svg+xml": return ".svg";
            case "application/pdf": return ".pdf";
            default: return "";
        }
    }

    /**
     * Extract S3 key from file URL.
     * Handles both /api/files/... format and full S3 URLs.
     */
    private String extractS3Key(String fileUrl) {
        if (fileUrl == null) {
            return null;
        }

        // Handle /api/files/... format
        if (fileUrl.startsWith("/api/files/")) {
            return fileUrl.substring("/api/files/".length());
        }

        // Handle full S3 URL format
        if (fileUrl.contains(".s3.") && fileUrl.contains(".amazonaws.com/")) {
            return fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + ".amazonaws.com/".length());
        }

        // Handle s3:// format
        if (fileUrl.startsWith("s3://")) {
            String path = fileUrl.substring(5);
            int slashIndex = path.indexOf('/');
            if (slashIndex > 0) {
                return path.substring(slashIndex + 1);
            }
        }

        return null;
    }

    /**
     * Get content type from file extension as fallback.
     */
    private String getContentTypeFromExtension(String fileUrl) {
        if (fileUrl == null) {
            return "application/octet-stream";
        }

        String lowerUrl = fileUrl.toLowerCase();
        if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerUrl.endsWith(".png")) {
            return "image/png";
        } else if (lowerUrl.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerUrl.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerUrl.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (lowerUrl.endsWith(".pdf")) {
            return "application/pdf";
        }
        return "application/octet-stream";
    }
}

