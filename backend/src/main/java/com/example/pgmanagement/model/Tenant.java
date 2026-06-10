package com.example.pgmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import this
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "tenants")
@Data
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String contact;
    private LocalDate joinDate;

    @OneToOne
    @JoinColumn(name = "room_id", unique = true)
    @JsonIgnoreProperties("tenant")
    private Room room;

}
