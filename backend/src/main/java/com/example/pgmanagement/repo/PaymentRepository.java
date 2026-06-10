package com.example.pgmanagement.repo;

import com.example.pgmanagement.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; 
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.month = :month AND p.year = :year AND p.status = 'Paid'")
    Double findTotalAmountByMonthAndYearAndStatus(@Param("month") int month, @Param("year") int year);

    @Modifying
    @Transactional
    @Query("DELETE FROM Payment p WHERE p.tenant.id = :tenantId")
    void deleteByTenantId(@Param("tenantId") Long tenantId);
}