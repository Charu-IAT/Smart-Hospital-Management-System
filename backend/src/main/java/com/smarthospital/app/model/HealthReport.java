package com.smarthospital.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private Double weight; // in kg

    @Column(nullable = false, length = 20)
    private String bp; // e.g. "120/80"

    private Double height; // in cm
    private Double temperature; // in °C
    
    @Column(name = "heart_rate")
    private Integer heartRate; // bpm
    
    @Column(name = "sugar_level")
    private Double sugarLevel; // mg/dL

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "date_recorded", nullable = false)
    private LocalDateTime dateRecorded;
}
