package org.example.controller;

import org.example.models.User;
import org.example.service.FileStoragePathBuilder;
import org.example.service.FileStorageService;
import org.example.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Value("${app.storage.allowed-image-types:image/jpeg,image/png,image/gif,image/webp}")
    private String allowedImageTypes;

    @Value("${app.storage.max-profile-image-size:2097152}")
    private long maxProfileImageSize;

    @Autowired
    public ProfileController(UserService userService, PasswordEncoder passwordEncoder, FileStorageService fileStorageService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Current password is required"
                ));
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "New password is required"
                ));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "New password must be at least 6 characters long"
                ));
            }

            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            var user = userOptional.get();
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Current password is incorrect"
                ));
            }

            // Change the password
            userService.changeUserPassword(user.getId(), newPassword);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password changed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to change password: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/update-profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String bio = request.get("bio");
            String designation = request.get("designation");
            String specialization = request.get("specialization");
            String licenseNumber = request.get("licenseNumber");
            String portfolioLink = request.get("portfolioLink");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Name is required"
                ));
            }
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email is required"
                ));
            }

            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            var user = userOptional.get();
            
            // Update the profile
            userService.updateUserProfile(user.getId(), name, email, bio, designation, specialization, licenseNumber, portfolioLink);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to update profile: " + e.getMessage()
            ));
        }
    }

    /**
     * Upload a profile image for the authenticated user.
     * 
     * Supports JPEG, PNG, GIF, and WebP formats up to 2MB.
     * The old profile image is automatically deleted when a new one is uploaded.
     */
    @PostMapping(value = "/upload-image", produces = "application/json")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        logger.info("=== Profile Image Upload Request ===");
        logger.info("User: {}", authentication != null ? authentication.getName() : "null");
        logger.info("File: name={}, size={}, type={}", 
            file != null ? file.getOriginalFilename() : "null",
            file != null ? file.getSize() : 0,
            file != null ? file.getContentType() : "null");
        
        try {
            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            User user = userOptional.get();

            // Validate the file
            String[] allowedTypes = allowedImageTypes.split(",");
            fileStorageService.validateFile(file, allowedTypes, maxProfileImageSize);

            // Delete old profile image if exists
            if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(user.getProfileImageUrl());
                    logger.info("Deleted old profile image for user: {}", username);
                } catch (Exception e) {
                    // Log but don't fail if old image deletion fails
                    logger.warn("Failed to delete old profile image for user {}: {}", username, e.getMessage());
                }
            }

            // Store the new image
            // Structure: profile-images/{orgId}/user_{userId}_{uuid}.{ext}
            Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : 0L;
            String directory = FileStoragePathBuilder.PROFILE_IMAGES + "/" + orgId;
            String filename = "user_" + user.getId();

            String imageUrl = fileStorageService.storeFile(file, directory, filename);

            // Update user profile with new image URL
            user.setProfileImageUrl(imageUrl);
            userService.save(user);

            logger.info("Profile image uploaded successfully for user: {} -> {}", username, imageUrl);

            Map<String, Object> successResponse = new java.util.HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Profile image uploaded successfully");
            successResponse.put("imageUrl", imageUrl);
            return ResponseEntity.ok(successResponse);

        } catch (FileStorageService.FileStorageException e) {
            logger.warn("FileStorageException uploading profile image: {}", e.getMessage());
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Exception uploading profile image: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to upload profile image: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Delete the profile image for the authenticated user.
     */
    @DeleteMapping("/delete-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProfileImage(Authentication authentication) {
        try {
            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            User user = userOptional.get();

            if (user.getProfileImageUrl() == null || user.getProfileImageUrl().isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "No profile image to delete"
                ));
            }

            // Delete the image file
            fileStorageService.deleteFile(user.getProfileImageUrl());

            // Clear the image URL from user profile
            user.setProfileImageUrl(null);
            userService.save(user);

            logger.info("Profile image deleted for user: {}", username);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile image deleted successfully"
            ));

        } catch (FileStorageService.FileStorageException e) {
            logger.warn("Failed to delete profile image: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error deleting profile image", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to delete profile image: " + e.getMessage()
            ));
        }
    }

    /**
     * Get the current user's profile image URL.
     */
    @GetMapping("/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfileImage(Authentication authentication) {
        try {
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            User user = userOptional.get();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "imageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : ""
            ));

        } catch (Exception e) {
            logger.error("Error getting profile image", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to get profile image: " + e.getMessage()
            ));
        }
    }

    /**
     * Get a presigned URL for uploading a profile image.
     */
    @GetMapping("/presigned-upload-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPresignedUploadUrl(
            @RequestParam("filename") String filename,
            @RequestParam("contentType") String contentType,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOptional.get();
            
            // Validate content type
            String[] allowedTypes = allowedImageTypes.split(",");
            boolean isAllowed = java.util.Arrays.stream(allowedTypes)
                .anyMatch(type -> contentType.equalsIgnoreCase(type));
                
            if (!isAllowed) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File type not allowed. Allowed: " + allowedImageTypes
                ));
            }

            Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : 0L;
            String directory = FileStoragePathBuilder.PROFILE_IMAGES + "/" + orgId;
            
            // Use "user_{id}" as the filename prefix
            String filenamePrefix = "user_" + user.getId();

            var response = fileStorageService.generatePresignedUploadUrl(directory, filenamePrefix, contentType);
            return ResponseEntity.ok(response);

        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error generating presigned upload URL", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Confirm that a profile image has been uploaded to S3 and update the user profile.
     */
    @PostMapping("/image-success")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> confirmProfileImageUpload(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String fileUrl = request.get("fileUrl");
            if (fileUrl == null || fileUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File URL is required"));
            }

            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOptional.get();

            // Verify file exists in storage
            if (!fileStorageService.fileExists(fileUrl)) {
                return ResponseEntity.badRequest().body(Map.of("error", "File not found in storage"));
            }

            // Delete old profile image if exists
            if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
                try {
                    // Don't delete if it's the same file (unlikely due to UUID)
                    if (!user.getProfileImageUrl().equals(fileUrl)) {
                        fileStorageService.deleteFile(user.getProfileImageUrl());
                    }
                } catch (Exception e) {
                    logger.warn("Failed to delete old profile image: {}", e.getMessage());
                }
            }

            // Update user profile
            user.setProfileImageUrl(fileUrl);
            userService.save(user);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile image updated successfully",
                "imageUrl", fileUrl
            ));

        } catch (Exception e) {
            logger.error("Error updating profile image", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

