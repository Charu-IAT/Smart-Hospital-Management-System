package com.smarthospital.app.controller;

import com.smarthospital.app.dto.AuthResponse;
import com.smarthospital.app.dto.LoginRequest;
import com.smarthospital.app.dto.RegisterRequest;
import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import com.smarthospital.app.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PatientRepository patientRepository, DoctorRepository doctorRepository,
                          DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

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
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());

        Role role;
        try {
            role = Role.valueOf(registerRequest.getRole());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: Invalid role!");
        }
        user.setRole(role);

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
            patientRepository.save(patient);
        } else if (role == Role.ROLE_DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setName(registerRequest.getName() != null ? registerRequest.getName() : registerRequest.getUsername());
            doctor.setSpecialization(registerRequest.getSpecialization() != null ? registerRequest.getSpecialization() : "General Practitioner");
            doctor.setSchedule(registerRequest.getSchedule() != null ? registerRequest.getSchedule() : "Mon-Fri: 9AM-5PM");
            
            if (registerRequest.getDepartmentId() != null) {
                departmentRepository.findById(registerRequest.getDepartmentId()).ifPresent(doctor::setDepartment);
            }
            doctorRepository.save(doctor);
        }

        return ResponseEntity.ok("User registered successfully!");
    }
}
