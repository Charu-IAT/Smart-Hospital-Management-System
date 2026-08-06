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
    private final InventoryRepository inventoryRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                           InventoryRepository inventoryRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.inventoryRepository = inventoryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Run database migration to ensure dosage column is wide enough (255 characters)
        try {
            jdbcTemplate.execute("ALTER TABLE prescriptions MODIFY COLUMN dosage VARCHAR(255)");
            System.out.println("[DB SCHEMA UPDATE] Successfully modified prescriptions.dosage column to VARCHAR(255).");
        } catch (Exception e) {
            System.out.println("[DB SCHEMA UPDATE] prescriptions.dosage alter table skipped/not needed: " + e.getMessage());
        }

        // Run database migration to ensure departments.name is unique
        try {
            jdbcTemplate.execute("ALTER TABLE departments ADD CONSTRAINT unique_department_name UNIQUE (name)");
            System.out.println("[DB SCHEMA UPDATE] Successfully added unique constraint to departments.name column.");
        } catch (Exception e) {
            System.out.println("[DB SCHEMA UPDATE] departments.name unique constraint alter table skipped/not needed: " + e.getMessage());
        }

        // Run database migration to ensure users table has phone column
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
            System.out.println("[DB SCHEMA UPDATE] Successfully added phone column to users table.");
        } catch (Exception e) {
            System.out.println("[DB SCHEMA UPDATE] users.phone column addition skipped/not needed: " + e.getMessage());
        }

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

        // Sanitize mismatched inventory statuses on startup
        java.util.List<Inventory> inventoryList = inventoryRepository.findAll();
        boolean updated = false;
        for (Inventory item : inventoryList) {
            String currentStatus = item.getStatus();
            String correctStatus;
            if (item.getQuantity() == null || item.getQuantity() == 0) {
                correctStatus = "OUT_OF_STOCK";
            } else if (item.getQuantity() <= item.getThreshold()) {
                correctStatus = "LOW_STOCK";
            } else {
                correctStatus = "IN_STOCK";
            }
            if (!correctStatus.equals(currentStatus)) {
                item.setStatus(correctStatus);
                inventoryRepository.save(item);
                updated = true;
            }
        }
        if (updated) {
            System.out.println("[DATA CLEANUP] Sanitized mismatched inventory stock statuses.");
        }

    }
}
