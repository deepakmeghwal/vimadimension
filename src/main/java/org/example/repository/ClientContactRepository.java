package org.example.repository;

import org.example.models.ClientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClientContactRepository extends JpaRepository<ClientContact, Long> {
    List<ClientContact> findByClientId(Long clientId);
}
