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
        // Seed ONLY the master Admin account if it does not exist.
        // This provides the entry point to register custom departments, clinicians, and records.
        if (userRepository.findByUsername("smartadmin").isEmpty()) {
            User admin = new User();
            admin.setUsername("smartadmin");
            admin.setPassword(passwordEncoder.encode("smartadmin123"));
            admin.setEmail("admin@smarthospital.com");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setDateCreated(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("\n[SEED SUCCESS] Master Admin account created (username: smartadmin / password: smartadmin123)\n");
        }

    }
}
