package com.example.pgmanagement.controller;

import com.example.pgmanagement.model.Payment;
import com.example.pgmanagement.model.Tenant;
import com.example.pgmanagement.repo.PaymentRepository;
import com.example.pgmanagement.repo.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);


    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @GetMapping
    public List<Payment> getAllPayments() {
        logger.info("Fetching all payments");
        return paymentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> payload) {
        logger.info("Received request to create payment: {}", payload);
        String tenantName = (String) payload.get("tenantName");
        Integer month = null;
        Integer year = null;
        Double amount = null;
        String status = (String) payload.get("status");

        try {
            Object monthObj = payload.get("month");
            if (monthObj instanceof Number) {
                month = ((Number) monthObj).intValue();
            } else if (monthObj instanceof String) {
                month = Integer.parseInt((String) monthObj);
            }

            Object yearObj = payload.get("year");
             if (yearObj instanceof Number) {
                year = ((Number) yearObj).intValue();
            } else if (yearObj instanceof String) {
                year = Integer.parseInt((String) yearObj);
            }

            Object amountObj = payload.get("amount");
             if (amountObj instanceof Number) {
                amount = ((Number) amountObj).doubleValue();
            } else if (amountObj instanceof String) {
                 amount = Double.parseDouble((String) amountObj);
            }


        } catch (NumberFormatException e) {
             logger.error("Error parsing number fields for payment: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid number format for month, year, or amount.");
        } catch (Exception e) {
             logger.error("Error processing payload fields: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error processing payment details.");
        }


        if (tenantName == null || tenantName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tenant name is required.");
        }
        if (month == null || year == null || amount == null || status == null) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required payment details (month, year, amount, status).");
        }
        if (month < 1 || month > 12) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid month value.");
        }


        Optional<Tenant> tenantOpt = tenantRepository.findByName(tenantName);
        if (tenantOpt.isEmpty()) {
             logger.warn("Tenant not found for payment creation: {}", tenantName);
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant with name '" + tenantName + "' not found.");
        }


        Payment payment = new Payment();
        payment.setTenant(tenantOpt.get());
        payment.setAmount(amount);
        payment.setMonth(month);
        payment.setYear(year);
        payment.setStatus(status);
        payment.setPaymentDate(LocalDate.now());

        try {
            Payment savedPayment = paymentRepository.save(payment);
            logger.info("Payment saved successfully for tenant {}: ID {}", tenantName, savedPayment.getId());
            return ResponseEntity.ok(savedPayment);
        } catch (Exception e) {
             logger.error("Error saving payment to database: {}", e.getMessage(), e);
             return ResponseEntity.internalServerError().body("Could not save payment: " + e.getMessage());
        }
    }


    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
         logger.info("Received request to update payment status for ID {}: {}", id, payload);
         String newStatus = payload.get("status");
         if (newStatus == null || (!newStatus.equals("Paid") && !newStatus.equals("Pending"))) {
              return ResponseEntity.badRequest().body("Invalid status value provided.");
         }

        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(newStatus);
             try {
                 Payment updatedPayment = paymentRepository.save(payment);
                 logger.info("Payment status updated successfully for ID {}", id);
                return ResponseEntity.ok(updatedPayment);
             } catch (Exception e) {
                  logger.error("Error updating payment status in database: {}", e.getMessage(), e);
                  return ResponseEntity.internalServerError().body("Could not update payment status: " + e.getMessage());
             }
        }).orElseGet(() -> {
             logger.warn("Payment not found for status update: ID {}", id);
             return ResponseEntity.notFound().build();
        });
    }

}