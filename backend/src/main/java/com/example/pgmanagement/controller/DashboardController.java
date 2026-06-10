package com.example.pgmanagement.controller;

import com.example.pgmanagement.repo.ComplaintRepository;
import com.example.pgmanagement.repo.PaymentRepository;
import com.example.pgmanagement.repo.RoomRepository;
import com.example.pgmanagement.repo.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);


    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        logger.info("Fetching dashboard stats");
        Map<String, Object> stats = new HashMap<>();

        try {
            stats.put("totalRooms", roomRepository.count());
            stats.put("totalTenants", tenantRepository.count());

            LocalDate now = LocalDate.now();
            int currentMonth = now.getMonthValue();
            int currentYear = now.getYear();
            logger.debug("Calculating rent for month: {}, year: {}", currentMonth, currentYear);

            Double rentCollected = paymentRepository.findTotalAmountByMonthAndYearAndStatus(currentMonth, currentYear);
            stats.put("rentCollected", rentCollected != null ? rentCollected : 0.0);
            
            stats.put("pendingComplaints", complaintRepository.countByStatus("Open"));
            
            logger.info("Dashboard stats calculated: {}", stats);
            return stats;

        } catch (Exception e) {
             logger.error("Error calculating dashboard stats: {}", e.getMessage(), e);
             stats.put("totalRooms", 0);
             stats.put("totalTenants", 0);
             stats.put("rentCollected", 0.0);
             stats.put("pendingComplaints", 0);
             stats.put("error", "Failed to calculate stats: " + e.getMessage());
             return stats;
        }
    }
}
