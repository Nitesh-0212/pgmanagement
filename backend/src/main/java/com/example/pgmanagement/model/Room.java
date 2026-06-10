package com.example.pgmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import this
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rooms")
@Data
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String number;
    private int capacity;
    private double rent;
    private String status;

    @OneToOne(mappedBy = "room")
    @JsonIgnoreProperties("room")
    private Tenant tenant;
}
