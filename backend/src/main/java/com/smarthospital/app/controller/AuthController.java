package com.smarthospital.app.controller;

import com.smarthospital.app.dto.AuthResponse;
import com.smarthospital.app.dto.LoginRequest;
import com.smarthospital.app.dto.RegisterRequest;
import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import com.smarthospital.app.security.JwtTokenProvider;
import com.smarthospital.app.service.SmsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Random;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final SmsService smsService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PatientRepository patientRepository, DoctorRepository doctorRepository,
                          DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider, SmsService smsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.smsService = smsService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsernameIgnoreCase(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ROLE_PATIENT) {
            // Bypass password validation for patient login
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name())));
            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            // Standard password authentication for doctors, staff, etc.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword()));
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        Long profileId = null;
        String name = user.getUsername();

        if (user.getRole() == Role.ROLE_PATIENT) {
            Optional<Patient> patient = patientRepository.findByUserId(user.getId());
            if (patient.isPresent()) {
                profileId = patient.get().getId();
                name = patient.get().getName();
            }
        } else if (user.getRole() == Role.ROLE_DOCTOR) {
            Optional<Doctor> doctor = doctorRepository.findByUserId(user.getId());
            if (doctor.isPresent()) {
                profileId = doctor.get().getId();
                name = doctor.get().getName();
            }
        }

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                user.getId(),
                profileId,
                name
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        String rawPassword = registerRequest.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "patient_bypass_password";
        }
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEmail(registerRequest.getEmail());

        Role role;
        try {
            String roleStr = registerRequest.getRole();
            if (roleStr != null) {
                roleStr = roleStr.trim().toUpperCase();
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
            }
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: Invalid role!");
        }

        // Ensure mobile/phone number is provided
        if (registerRequest.getPhone() == null || registerRequest.getPhone().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Mobile number is required for OTP verification!");
        }

        user.setRole(role);
        user.setPhone(registerRequest.getPhone().trim());

        User savedUser = userRepository.save(user);

        if (role == Role.ROLE_PATIENT) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setName(registerRequest.getName() != null ? registerRequest.getName() : registerRequest.getUsername());
            patient.setAge(registerRequest.getAge());
            patient.setGender(registerRequest.getGender());
            patient.setBloodGroup(registerRequest.getBloodGroup());
            patient.setAddress(registerRequest.getAddress());
            patient.setPhone(registerRequest.getPhone());
            patient.setAllergies(registerRequest.getAllergies() != null && !registerRequest.getAllergies().trim().isEmpty() ? registerRequest.getAllergies() : "None");
            patient.setMedicalHistory(registerRequest.getMedicalHistory() != null && !registerRequest.getMedicalHistory().trim().isEmpty() ? registerRequest.getMedicalHistory() : "None");
            patientRepository.save(patient);
        } else if (role == Role.ROLE_DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setName(registerRequest.getName() != null ? registerRequest.getName() : registerRequest.getUsername());
            doctor.setSchedule(registerRequest.getSchedule() != null ? registerRequest.getSchedule() : "Mon-Fri: 9AM-5PM");
            
            if (registerRequest.getDepartmentId() != null) {
                Department dept = departmentRepository.findById(registerRequest.getDepartmentId()).orElse(null);
                if (dept != null) {
                    doctor.setDepartment(dept);
                    doctor.setSpecialization(dept.getName());
                } else {
                    doctor.setSpecialization("General Practitioner");
                }
            } else {
                doctor.setSpecialization("General Practitioner");
            }
            doctorRepository.save(doctor);
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Username is required!");
        }

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: Username not found!");
        }

        // Retrieve registered phone number
        String phone = "+1-555-0199";
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            phone = user.getPhone();
        } else if (user.getRole() == Role.ROLE_PATIENT) {
            Optional<Patient> patient = patientRepository.findByUserId(user.getId());
            if (patient.isPresent() && patient.get().getPhone() != null) {
                phone = patient.get().getPhone();
            }
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send actual SMS via Twilio (falls back to simulation if no keys)
        boolean sentRealSms = smsService.sendSms(phone, "Your Smart Hospital password reset OTP code is: " + otp + ". This code expires in 10 minutes.");

        String message = sentRealSms 
            ? "OTP sent successfully to registered mobile number!" 
            : "OTP sent successfully (Simulated Console Delivery)!";

        return ResponseEntity.ok(Map.of(
            "message", message,
            "phoneMask", maskPhone(phone),
            "otp", otp
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (username == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Error: Missing required fields!");
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: Username not found!");
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp) || user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired OTP!");
        }

        // Reset password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully!");
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }
}
