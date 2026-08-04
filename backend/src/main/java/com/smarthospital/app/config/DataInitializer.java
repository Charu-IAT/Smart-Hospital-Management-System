package com.smarthospital.app.config;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed ONLY the master Admin account if the database is empty.
        // This provides the entry point to register custom departments, clinicians, and records.
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@smarthospital.com");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setDateCreated(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("\n[SEED SUCCESS] Master Admin account created (username: admin / password: admin123)\n");
        }

        if (userRepository.findByUsername("pharmacy").isEmpty()) {
            User pharmacist = new User();
            pharmacist.setUsername("pharmacy");
            pharmacist.setPassword(passwordEncoder.encode("pharmacy123"));
            pharmacist.setEmail("pharmacy@smarthospital.com");
            pharmacist.setRole(Role.ROLE_PHARMACIST);
            pharmacist.setDateCreated(LocalDateTime.now());
            userRepository.save(pharmacist);
            System.out.println("[SEED SUCCESS] Pharmacist account created (username: pharmacy / password: pharmacy123)");
        }

        if (userRepository.findByUsername("lab").isEmpty()) {
            User labStaff = new User();
            labStaff.setUsername("lab");
            labStaff.setPassword(passwordEncoder.encode("lab123"));
            labStaff.setEmail("lab@smarthospital.com");
            labStaff.setRole(Role.ROLE_LAB_STAFF);
            labStaff.setDateCreated(LocalDateTime.now());
            userRepository.save(labStaff);
            System.out.println("[SEED SUCCESS] Lab Staff account created (username: lab / password: lab123)");
        }
    }
}
