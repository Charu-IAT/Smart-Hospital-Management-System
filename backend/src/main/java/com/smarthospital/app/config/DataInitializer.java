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
    }
}
