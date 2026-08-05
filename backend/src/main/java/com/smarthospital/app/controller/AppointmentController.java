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

    private java.time.LocalTime getSlotStartTime(String slot) {
        if (slot == null) return java.time.LocalTime.MIN;
        String s = slot.trim().toUpperCase();
        if (s.startsWith("09:00 AM")) return java.time.LocalTime.of(9, 0);
        if (s.startsWith("10:00 AM")) return java.time.LocalTime.of(10, 0);
        if (s.startsWith("11:30 AM")) return java.time.LocalTime.of(11, 30);
        if (s.startsWith("02:00 PM")) return java.time.LocalTime.of(14, 0);
        if (s.startsWith("03:30 PM")) return java.time.LocalTime.of(15, 30);
        return java.time.LocalTime.MIN;
    }

    private boolean isDayAllowed(java.time.DayOfWeek day, String schedule) {
        if (schedule == null || schedule.isEmpty()) return true;
        String s = schedule.toLowerCase();
        
        if (s.contains("mon-fri")) {
            return day != java.time.DayOfWeek.SATURDAY && day != java.time.DayOfWeek.SUNDAY;
        }
        if (s.contains("mon-sat")) {
            return day != java.time.DayOfWeek.SUNDAY;
        }
        if (s.contains("mon-sun") || s.contains("daily") || s.contains("everyday")) {
            return true;
        }
        
        String dayName = day.name().toLowerCase();
        String dayAbbr = dayName.substring(0, 3);
        
        if (s.contains(dayAbbr) || s.contains(dayName)) {
            return true;
        }
        
        return !s.contains("mon") && !s.contains("tue") && !s.contains("wed") && !s.contains("thu") && !s.contains("fri");
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Appointment request) {
        User user = getAuthenticatedUser();
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Validate appointment date is not in the past
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Appointment date cannot be in the past.");
        }

        // Validate time slot is not in the past if the appointment is for today
        if (request.getAppointmentDate().equals(LocalDate.now())) {
            java.time.LocalTime slotStart = getSlotStartTime(request.getTimeSlot());
            if (java.time.LocalTime.now().isAfter(slotStart)) {
                return ResponseEntity.badRequest().body("The selected time slot is already in the past for today.");
            }
        }

        // Validate doctor availability schedule day of week
        java.time.DayOfWeek dayOfWeek = request.getAppointmentDate().getDayOfWeek();
        if (!isDayAllowed(dayOfWeek, doctor.getSchedule())) {
            return ResponseEntity.badRequest().body("Doctor " + doctor.getName() + " is not scheduled to work on " + dayOfWeek + ". Doctor's schedule: " + doctor.getSchedule());
        }

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
