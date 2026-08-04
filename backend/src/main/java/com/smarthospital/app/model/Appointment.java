package com.smarthospital.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "time_slot", nullable = false, length = 50)
    private String timeSlot;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, COMPLETED, CANCELLED

    @Column(name = "consultation_type", length = 20)
    private String consultationType = "IN_PERSON"; // IN_PERSON, VIDEO

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "UNPAID"; // UNPAID, PAID
}
