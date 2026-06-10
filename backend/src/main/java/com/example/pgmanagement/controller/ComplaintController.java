package com.example.pgmanagement.controller;

import com.example.pgmanagement.model.Complaint;
import com.example.pgmanagement.model.Tenant;
import com.example.pgmanagement.repo.ComplaintRepository;
import com.example.pgmanagement.repo.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, String> payload) {
        String tenantName = payload.get("tenantName");
        String description = payload.get("description");

        Optional<Tenant> tenantOpt = tenantRepository.findByName(tenantName);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant with name '" + tenantName + "' not found.");
        }

        Complaint complaint = new Complaint();
        complaint.setTenant(tenantOpt.get());
        complaint.setDescription(description);
        complaint.setStatus("Open");
        complaint.setDate(LocalDate.now());

        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(payload.get("status"));
            Complaint updated = complaintRepository.save(complaint);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        if (!complaintRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        complaintRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}