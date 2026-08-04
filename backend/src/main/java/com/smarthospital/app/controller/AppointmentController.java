package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BillingRepository billingRepository;

    public AppointmentController(AppointmentRepository appointmentRepository, PatientRepository patientRepository,
                                 DoctorRepository doctorRepository, UserRepository userRepository,
                                 BillingRepository billingRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.billingRepository = billingRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Appointment request) {
        User user = getAuthenticatedUser();
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check if doctor is already booked for this date and time slot
        List<Appointment> doctorAppointments = appointmentRepository.findByDoctorId(doctor.getId());
        boolean alreadyBooked = doctorAppointments.stream()
                .anyMatch(app -> app.getAppointmentDate().equals(request.getAppointmentDate())
                        && app.getTimeSlot().equalsIgnoreCase(request.getTimeSlot())
                        && !app.getStatus().equalsIgnoreCase("CANCELLED"));

        if (alreadyBooked) {
            return ResponseEntity.badRequest().body("This doctor is not available for this time slot (already booked).");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setConsultationType(request.getConsultationType());
        appointment.setStatus("PENDING");
        appointment.setPaymentStatus("UNPAID");

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create billing invoice
        Billing billing = new Billing();
        billing.setPatient(patient);
        billing.setAppointment(savedAppointment);
        billing.setConsultationFee(BigDecimal.valueOf(50.00));
        billing.setTotalAmount(BigDecimal.valueOf(50.00));
        billing.setStatus("UNPAID");
        billing.setBillingDate(LocalDate.now());
        billingRepository.save(billing);

        return ResponseEntity.ok(savedAppointment);
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Appointment>> getPatientAppointments() {
        User user = getAuthenticatedUser();
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return ResponseEntity.ok(appointmentRepository.findByPatientId(patient.getId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(@RequestParam Long doctorId,
                                                       @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Appointment> apps = appointmentRepository.findByDoctorId(doctorId);
        List<String> bookedSlots = apps.stream()
                .filter(app -> app.getAppointmentDate().equals(date) && !app.getStatus().equalsIgnoreCase("CANCELLED"))
                .map(Appointment::getTimeSlot)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(bookedSlots);
    }
}
