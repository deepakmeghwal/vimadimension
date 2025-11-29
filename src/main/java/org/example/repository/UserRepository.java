package org.example.repository;

import org.example.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Organization-based queries - using correct JPA property path
    List<User> findByOrganization_Id(Long organizationId);
    List<User> findByOrganization_IdAndEnabled(Long organizationId, boolean enabled);
    long countByOrganization_Id(Long organizationId);

    // Paginated queries
    Page<User> findByOrganization_Id(Long organizationId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.organization.id = :organizationId AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsersPaginated(@Param("organizationId") Long organizationId, @Param("query") String query, Pageable pageable);
}