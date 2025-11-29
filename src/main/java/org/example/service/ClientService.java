package org.example.service;

import org.example.models.Client;
import org.example.models.Organization;
import org.example.repository.ClientRepository;
import org.example.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private org.example.repository.ClientContactRepository clientContactRepository;

    @Transactional(readOnly = true)
    public List<Client> searchClients(Long organizationId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return clientRepository.findByOrganizationId(organizationId);
        }
        return clientRepository.searchClients(organizationId, query);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Client> searchClientsPaginated(Long organizationId, String query, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        if (query == null || query.trim().isEmpty()) {
            return clientRepository.findByOrganizationId(organizationId, pageable);
        }
        return clientRepository.searchClientsPaginated(organizationId, query, pageable);
    }

    @Transactional
    public Client createClient(Long organizationId, String name, String code, String email, String billingAddress, Client.PaymentTerms paymentTerms) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (code != null && clientRepository.existsByOrganizationIdAndCode(organizationId, code)) {
            throw new IllegalArgumentException("Client code already exists for this organization");
        }
        
        // Generate code if not provided
        if (code == null || code.trim().isEmpty()) {
            code = generateClientCode(name);
            // Ensure uniqueness
            int counter = 1;
            String originalCode = code;
            while (clientRepository.existsByOrganizationIdAndCode(organizationId, code)) {
                code = originalCode + "-" + counter++;
            }
        }

        Client client = new Client(name, code, organization);
        client.setEmail(email);
        client.setBillingAddress(billingAddress);
        client.setPaymentTerms(paymentTerms);
        
        return clientRepository.save(client);
    }

    private String generateClientCode(String name) {
        if (name == null || name.isEmpty()) return "CLI";
        String code = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        return code.length() > 4 ? code.substring(0, 4) : code;
    }

    @Transactional(readOnly = true)
    public Optional<Client> getClientById(Long organizationId, Long clientId) {
        return clientRepository.findByOrganizationIdAndId(organizationId, clientId);
    }

    @Transactional(readOnly = true)
    public List<org.example.models.ClientContact> getClientContacts(Long clientId) {
        return clientContactRepository.findByClientId(clientId);
    }

    @Transactional
    public org.example.models.ClientContact createClientContact(Long clientId, String name, String email, String phone, String role) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        
        org.example.models.ClientContact contact = new org.example.models.ClientContact(name, email, client);
        contact.setPhone(phone);
        contact.setRole(role);
        
        return clientContactRepository.save(contact);
    }

    @Transactional
    public Client updateClient(Long organizationId, Long clientId, String email, String billingAddress, String state, String gstin, Client.PaymentTerms paymentTerms) {
        Client client = clientRepository.findByOrganizationIdAndId(organizationId, clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        // Update only the allowed fields (not name or code)
        if (email != null) {
            client.setEmail(email);
        }
        if (billingAddress != null) {
            client.setBillingAddress(billingAddress);
        }
        if (state != null) {
            client.setState(state);
        }
        if (gstin != null) {
            client.setGstin(gstin);
        }
        if (paymentTerms != null) {
            client.setPaymentTerms(paymentTerms);
        }

        return clientRepository.save(client);
    }

}
