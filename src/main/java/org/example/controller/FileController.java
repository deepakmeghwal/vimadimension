package org.example.controller;

import org.example.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * Controller for serving stored files.
 * 
 * Files are served with appropriate caching headers for optimal performance.
 * This controller handles all file types stored via FileStorageService.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    private final FileStorageService fileStorageService;

    @Autowired
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Serves a file from storage.
     * Handles paths like: /api/files/profile-images/2/user_4_abc123.png
     * 
     * @param request The HTTP request to extract the full path
     * @return The file content with appropriate headers
     */
    @GetMapping("/**")
    public ResponseEntity<byte[]> serveFile(jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Get the full path after /api/files/
            String fullPath = request.getRequestURI();
            logger.info("Serving file request: {}", fullPath);
            
            // The fileUrl is the full path including /api/files/
            String fileUrl = fullPath;

            if (!fileStorageService.fileExists(fileUrl)) {
                logger.warn("File not found: {}", fileUrl);
                return ResponseEntity.notFound().build();
            }

            byte[] fileBytes = fileStorageService.getFileBytes(fileUrl);
            String contentType = fileStorageService.getContentType(fileUrl);

            logger.info("Serving file: {} ({} bytes, type: {})", fileUrl, fileBytes.length, contentType);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic());
            headers.setContentLength(fileBytes.length);
            
            // CORS headers for CloudFront
            headers.setAccessControlAllowOrigin("*");
            headers.setAccessControlAllowMethods(Arrays.asList(HttpMethod.GET, HttpMethod.HEAD, HttpMethod.OPTIONS));
            headers.setAccessControlMaxAge(3600L);

            logger.info("Returning file: {} bytes, Content-Type: {}", fileBytes.length, contentType);
            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
        } catch (FileStorageService.FileStorageException e) {
            logger.error("Error serving file: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error serving file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generates a presigned URL for uploading a file directly to storage.
     */
    @GetMapping("/presigned-upload-url")
    public ResponseEntity<?> getPresignedUploadUrl(
            @RequestParam("filename") String filename,
            @RequestParam("contentType") String contentType,
            @RequestParam("directory") String directory) {
        try {
            logger.info("Generating presigned upload URL for: {}/{} ({})", directory, filename, contentType);
            var response = fileStorageService.generatePresignedUploadUrl(directory, filename, contentType);
            return ResponseEntity.ok(response);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error generating presigned upload URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Generates a presigned URL for downloading a file directly from storage.
     */
    @GetMapping("/presigned-download-url")
    public ResponseEntity<?> getPresignedDownloadUrl(@RequestParam("fileUrl") String fileUrl) {
        try {
            logger.info("Generating presigned download URL for: {}", fileUrl);
            String downloadUrl = fileStorageService.generatePresignedDownloadUrl(fileUrl);
            return ResponseEntity.ok(java.util.Map.of("downloadUrl", downloadUrl));
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error generating presigned download URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}


