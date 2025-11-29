package org.example.controller;

import org.example.models.Organization;
import org.example.models.User;
import org.example.repository.OrganizationRepository;
import org.example.service.FileStoragePathBuilder;
import org.example.service.FileStorageService;
import org.example.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/organization")
public class OrganizationController {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationController.class);

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${app.storage.allowed-image-types:image/jpeg,image/png,image/gif,image/webp}")
    private String allowedImageTypes;

    @Value("${app.storage.max-profile-image-size:2097152}")
    private long maxLogoImageSize;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')") // Adjust permissions as needed
    public ResponseEntity<?> getMyOrganization(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsernameWithOrganization(username);

            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();
            Organization organization = user.getOrganization();

            if (organization == null) {
                response.put("success", false);
                response.put("message", "User is not associated with any organization");
                return ResponseEntity.status(404).body(response);
            }

            return ResponseEntity.ok(organization);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching organization: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // Only admins should update organization details
    public ResponseEntity<?> updateMyOrganization(@RequestBody Organization updatedOrg, Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsernameWithOrganization(username);

            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();
            Organization organization = user.getOrganization();

            if (organization == null) {
                response.put("success", false);
                response.put("message", "User is not associated with any organization");
                return ResponseEntity.status(404).body(response);
            }

            // Update allowed fields
            if (updatedOrg.getName() != null) organization.setName(updatedOrg.getName());
            if (updatedOrg.getDescription() != null) organization.setDescription(updatedOrg.getDescription());
            if (updatedOrg.getContactEmail() != null) organization.setContactEmail(updatedOrg.getContactEmail());
            if (updatedOrg.getContactPhone() != null) organization.setContactPhone(updatedOrg.getContactPhone());
            if (updatedOrg.getAddress() != null) organization.setAddress(updatedOrg.getAddress());
            if (updatedOrg.getWebsite() != null) organization.setWebsite(updatedOrg.getWebsite());
            
            // Update Indian invoice fields
            if (updatedOrg.getLogoUrl() != null) organization.setLogoUrl(updatedOrg.getLogoUrl());
            if (updatedOrg.getGstin() != null) organization.setGstin(updatedOrg.getGstin());
            if (updatedOrg.getPan() != null) organization.setPan(updatedOrg.getPan());
            if (updatedOrg.getCoaRegNumber() != null) organization.setCoaRegNumber(updatedOrg.getCoaRegNumber());
            if (updatedOrg.getAddressLine1() != null) organization.setAddressLine1(updatedOrg.getAddressLine1());
            if (updatedOrg.getAddressLine2() != null) organization.setAddressLine2(updatedOrg.getAddressLine2());
            if (updatedOrg.getCity() != null) organization.setCity(updatedOrg.getCity());
            if (updatedOrg.getState() != null) organization.setState(updatedOrg.getState());
            if (updatedOrg.getPincode() != null) organization.setPincode(updatedOrg.getPincode());
            
            // Update bank details
            if (updatedOrg.getBankName() != null) organization.setBankName(updatedOrg.getBankName());
            if (updatedOrg.getBankAccountNumber() != null) organization.setBankAccountNumber(updatedOrg.getBankAccountNumber());
            if (updatedOrg.getBankIfsc() != null) organization.setBankIfsc(updatedOrg.getBankIfsc());
            if (updatedOrg.getBankBranch() != null) organization.setBankBranch(updatedOrg.getBankBranch());
            if (updatedOrg.getBankAccountName() != null) organization.setBankAccountName(updatedOrg.getBankAccountName());

            Organization savedOrg = organizationRepository.save(organization);

            response.put("success", true);
            response.put("message", "Organization updated successfully");
            response.put("organization", savedOrg);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating organization: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Upload a logo image for the organization.
     * 
     * Supports JPEG, PNG, GIF, and WebP formats up to 2MB.
     * The old logo image is automatically deleted when a new one is uploaded.
     */
    @PostMapping(value = "/upload-logo", produces = "application/json")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadOrganizationLogo(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        logger.info("=== Organization Logo Upload Request ===");
        logger.info("User: {}", authentication != null ? authentication.getName() : "null");
        logger.info("File: name={}, size={}, type={}", 
            file != null ? file.getOriginalFilename() : "null",
            file != null ? file.getSize() : 0,
            file != null ? file.getContentType() : "null");
        
        try {
            // Get the current user and organization
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsernameWithOrganization(username);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            User user = userOpt.get();
            Organization organization = user.getOrganization();

            if (organization == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User is not associated with any organization"
                ));
            }

            // Validate the file
            String[] allowedTypes = allowedImageTypes.split(",");
            fileStorageService.validateFile(file, allowedTypes, maxLogoImageSize);

            // Delete old logo image if exists
            if (organization.getLogoUrl() != null && !organization.getLogoUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(organization.getLogoUrl());
                    logger.info("Deleted old logo image for organization: {}", organization.getId());
                } catch (Exception e) {
                    // Log but don't fail if old image deletion fails
                    logger.warn("Failed to delete old logo image for organization {}: {}", organization.getId(), e.getMessage());
                }
            }

            // Store the new image
            // Structure: organization-logos/{orgId}/logo_{uuid}.{ext}
            Long orgId = organization.getId();
            String directory = FileStoragePathBuilder.ORGANIZATION_LOGOS + "/" + orgId;
            String filename = "logo";

            String imageUrl = fileStorageService.storeFile(file, directory, filename);

            // Update organization with new logo URL
            organization.setLogoUrl(imageUrl);
            organizationRepository.save(organization);

            logger.info("Organization logo uploaded successfully for org: {} -> {}", orgId, imageUrl);

            Map<String, Object> successResponse = new java.util.HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Organization logo uploaded successfully");
            successResponse.put("imageUrl", imageUrl);
            return ResponseEntity.ok(successResponse);

        } catch (FileStorageService.FileStorageException e) {
            logger.warn("FileStorageException uploading organization logo: {}", e.getMessage());
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Exception uploading organization logo: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to upload organization logo: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Delete the logo image for the organization.
     */
    @DeleteMapping("/delete-logo")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteOrganizationLogo(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsernameWithOrganization(username);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            User user = userOpt.get();
            Organization organization = user.getOrganization();

            if (organization == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User is not associated with any organization"
                ));
            }

            if (organization.getLogoUrl() == null || organization.getLogoUrl().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No logo to delete"
                ));
            }

            // Delete the file
            try {
                fileStorageService.deleteFile(organization.getLogoUrl());
            } catch (Exception e) {
                logger.warn("Failed to delete logo file: {}", e.getMessage());
            }

            // Update organization
            organization.setLogoUrl(null);
            organizationRepository.save(organization);

            Map<String, Object> successResponse = new java.util.HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Organization logo deleted successfully");
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("Exception deleting organization logo: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to delete organization logo: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
