package com.example.pgmanagement.repo;

import com.example.pgmanagement.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; 
import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    long countByStatus(String status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Complaint c WHERE c.tenant.id = :tenantId")
    void deleteByTenantId(@Param("tenantId") Long tenantId);
}