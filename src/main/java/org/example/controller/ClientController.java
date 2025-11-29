package org.example.controller;

import org.example.models.Client;
import org.example.models.User;
import org.example.service.ClientService;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchClients(@RequestParam(value = "query", required = false) String query) {
        User currentUser = getCurrentUser();
        List<Client> clients = clientService.searchClients(currentUser.getOrganization().getId(), query);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchClientsPaginated(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        org.springframework.data.domain.Page<Client> clients = clientService.searchClientsPaginated(currentUser.getOrganization().getId(), query, page, size);
        return ResponseEntity.ok(clients);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createClient(@RequestBody Map<String, Object> payload) {
        User currentUser = getCurrentUser();
        String name = (String) payload.get("name");
        String code = (String) payload.get("code");
        String email = (String) payload.get("email");
        String billingAddress = (String) payload.get("billingAddress");
        String paymentTermsStr = (String) payload.get("paymentTerms");
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Client name is required");
        }

        Client.PaymentTerms paymentTerms = null;
        if (paymentTermsStr != null) {
            try {
                paymentTerms = Client.PaymentTerms.valueOf(paymentTermsStr);
            } catch (IllegalArgumentException e) {
                // Ignore invalid enum, leave null
            }
        }

        try {
            Client client = clientService.createClient(
                currentUser.getOrganization().getId(), 
                name, 
                code, 
                email, 
                billingAddress, 
                paymentTerms
            );
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{clientId}/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getClientContacts(@PathVariable Long clientId) {
        // TODO: Add security check to ensure user belongs to the same organization as the client
        return ResponseEntity.ok(clientService.getClientContacts(clientId));
    }

    @PostMapping("/{clientId}/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createClientContact(@PathVariable Long clientId, @RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String role = payload.get("role");

        if (name == null || email == null) {
            return ResponseEntity.badRequest().body("Name and email are required");
        }

        try {
            org.example.models.ClientContact contact = clientService.createClientContact(clientId, name, email, phone, role);
            return ResponseEntity.ok(contact);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{clientId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateClient(@PathVariable Long clientId, @RequestBody Map<String, Object> payload) {
        User currentUser = getCurrentUser();
        String email = (String) payload.get("email");
        String billingAddress = (String) payload.get("billingAddress");
        String state = (String) payload.get("state");
        String gstin = (String) payload.get("gstin");
        String paymentTermsStr = (String) payload.get("paymentTerms");

        Client.PaymentTerms paymentTerms = null;
        if (paymentTermsStr != null) {
            try {
                paymentTerms = Client.PaymentTerms.valueOf(paymentTermsStr);
            } catch (IllegalArgumentException e) {
                // Ignore invalid enum, leave null
            }
        }

        try {
            Client client = clientService.updateClient(
                currentUser.getOrganization().getId(),
                clientId,
                email,
                billingAddress,
                state,
                gstin,
                paymentTerms
            );
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
