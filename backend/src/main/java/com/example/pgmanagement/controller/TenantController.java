package com.example.pgmanagement.controller;

import com.example.pgmanagement.model.Room;
import com.example.pgmanagement.model.Tenant;
import com.example.pgmanagement.repo.ComplaintRepository;
import com.example.pgmanagement.repo.PaymentRepository;
import com.example.pgmanagement.repo.RoomRepository;
import com.example.pgmanagement.repo.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private static final Logger logger = LoggerFactory.getLogger(TenantController.class);

    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ComplaintRepository complaintRepository; 

    @GetMapping
    public List<Tenant> getAllTenants() {
        logger.info("Fetching all tenants");
        List<Tenant> tenants = tenantRepository.findAll();
        logger.info("Returning {} tenants", tenants.size());
        return tenants;
    }

    @PostMapping
    public ResponseEntity<?> createTenant(@RequestBody Tenant tenant) {
         try {
            logger.info("Attempting to save tenant: {}", tenant.getName());
            Tenant savedTenant = tenantRepository.save(tenant);
            logger.info("Tenant saved successfully with ID: {}", savedTenant.getId());
            return ResponseEntity.ok(savedTenant);
         } catch (Exception e) {
             logger.error("Error saving tenant: {}", e.getMessage(), e);
             return ResponseEntity.internalServerError().body("Error saving tenant: " + e.getMessage());
         }
    }


    @PatchMapping("/{tenantId}/assign-room")
    public ResponseEntity<?> assignRoom(@PathVariable Long tenantId, @RequestBody Map<String, Long> payload) {
        Long roomId = payload.get("roomId");
        logger.info("Attempting to assign room {} to tenant {}", roomId, tenantId);
        if (roomId == null) {
            return ResponseEntity.badRequest().body("Room ID is required.");
        }
        return tenantRepository.findById(tenantId).map(tenant -> {
            return roomRepository.findById(roomId).map(room -> {
                if (!"Available".equalsIgnoreCase(room.getStatus())) {
                     logger.warn("Attempted to assign an occupied room: Room ID {}", roomId);
                     return ResponseEntity.badRequest().body("Room is not available.");
                }
                tenant.setRoom(room);
                room.setStatus("Occupied");
                try {
                    roomRepository.save(room);
                    Tenant updatedTenant = tenantRepository.save(tenant);
                    logger.info("Successfully assigned room {} to tenant {}", roomId, tenantId);
                    return ResponseEntity.ok(updatedTenant);
                } catch (Exception e) {
                     logger.error("Error saving room or tenant during assignment: {}", e.getMessage(), e);
                     return ResponseEntity.internalServerError().body("Error during assignment: " + e.getMessage());
                }
            }).orElseGet(() -> {
                 logger.warn("Room not found for assignment: Room ID {}", roomId);
                 return ResponseEntity.notFound().build();
            });
        }).orElseGet(() -> {
            logger.warn("Tenant not found for assignment: Tenant ID {}", tenantId);
            return ResponseEntity.notFound().build();
        });
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTenant(@PathVariable Long id) {
        logger.info("Attempting to delete tenant with ID: {}", id);
        return tenantRepository.findById(id).map(tenant -> {
            try {
                // 1. Delete associated payments
                logger.info("Deleting payments for tenant ID: {}", id);
                paymentRepository.deleteByTenantId(id);

                // 2. Delete associated complaints
                logger.info("Deleting complaints for tenant ID: {}", id);
                complaintRepository.deleteByTenantId(id);

                // 3. Update room status if assigned
                if (tenant.getRoom() != null) {
                    Room room = tenant.getRoom();
                    logger.info("Making room {} available due to tenant deletion.", room.getId());
                    room.setStatus("Available");
                    roomRepository.save(room);
                }

                // 4. Delete the tenant
                tenantRepository.delete(tenant);
                logger.info("Tenant deleted successfully: ID {}", id);
                return ResponseEntity.ok().build();

            } catch (Exception e) {
                 logger.error("Error deleting tenant or associated records: {}", e.getMessage(), e);
                 return ResponseEntity.internalServerError().body("Error during deletion: " + e.getMessage());
            }
        }).orElseGet(() -> {
             logger.warn("Tenant not found for deletion: ID {}", id);
             return ResponseEntity.notFound().build();
        });
    }
}
