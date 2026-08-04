package com.smarthospital.app.config;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, DepartmentRepository departmentRepository,
                           DoctorRepository doctorRepository, PatientRepository patientRepository,
                           MedicineRepository medicineRepository, InventoryRepository inventoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Departments
        if (departmentRepository.count() == 0) {
            departmentRepository.saveAll(List.of(
                new Department(null, "Cardiology", "Heart health and treatment"),
                new Department(null, "Neurology", "Brain and nervous system disorders"),
                new Department(null, "Pediatrics", "Infant and child healthcare"),
                new Department(null, "Dermatology", "Skin, hair, and nail treatments"),
                new Department(null, "Orthopedics", "Bone, joint, and muscle care"),
                new Department(null, "General Medicine", "Common ailments, routine checkups")
            ));
        }

        // 2. Seed Medicines
        if (medicineRepository.count() == 0) {
            medicineRepository.saveAll(List.of(
                new Medicine(null, "Amoxicillin 500mg", "Antibiotic", 250, LocalDate.now().plusYears(1), BigDecimal.valueOf(8.50), "Amoxicillin"),
                new Medicine(null, "Atorvastatin 20mg", "Cardiovascular", 150, LocalDate.now().plusYears(2), BigDecimal.valueOf(12.00), "Lipitor"),
                new Medicine(null, "Metformin 850mg", "Antidiabetic", 300, LocalDate.now().plusYears(1), BigDecimal.valueOf(6.00), "Glucophage"),
                new Medicine(null, "Lisinopril 10mg", "Antihypertensive", 180, LocalDate.now().plusYears(1), BigDecimal.valueOf(9.50), "Zestril"),
                new Medicine(null, "Ibuprofen 400mg", "Analgesic", 400, LocalDate.now().plusYears(2), BigDecimal.valueOf(4.20), "Advil"),
                new Medicine(null, "Cetirizine 10mg", "Antihistamine", 220, LocalDate.now().plusYears(1), BigDecimal.valueOf(3.80), "Zyrtec"),
                new Medicine(null, "Paracetamol 650mg", "Antipyretic", 500, LocalDate.now().plusYears(2), BigDecimal.valueOf(2.50), "Acetaminophen"),
                new Medicine(null, "Omeprazole 20mg", "Gastrointestinal", 160, LocalDate.now().plusYears(1), BigDecimal.valueOf(7.40), "Prilosec")
            ));
        }

        // 3. Seed Inventory
        if (inventoryRepository.count() == 0) {
            inventoryRepository.saveAll(List.of(
                new Inventory(null, "Disposable Syringes 5ml", "Consumables", 80, 50, "IN_STOCK"),
                new Inventory(null, "Surgical Face Masks (Box of 50)", "PPE", 40, 20, "IN_STOCK"),
                new Inventory(null, "Surgical Gloves Size 7.5 (Box of 50)", "PPE", 15, 20, "LOW_STOCK"),
                new Inventory(null, "Normal Saline IV Fluid 500ml", "Fluids", 120, 30, "IN_STOCK"),
                new Inventory(null, "Adhesive Bandages 1 Inch", "Consumables", 200, 100, "IN_STOCK"),
                new Inventory(null, "Oxygen Masks (Adult)", "Equipments", 8, 10, "LOW_STOCK"),
                new Inventory(null, "Sterile Gauze Pads 4x4", "Consumables", 300, 100, "IN_STOCK"),
                new Inventory(null, "Digital Thermometer", "Devices", 5, 10, "LOW_STOCK")
            ));
        }

        // 4. Seed Users
        if (userRepository.count() == 0) {
            // Admin
            User adminUser = new User(null, "admin", passwordEncoder.encode("admin123"), "admin@shms.com", Role.ROLE_ADMIN, java.time.LocalDateTime.now());
            userRepository.save(adminUser);

            // Doctor
            User docUser = new User(null, "doctor", passwordEncoder.encode("doctor123"), "doctor@shms.com", Role.ROLE_DOCTOR, java.time.LocalDateTime.now());
            userRepository.save(docUser);
            
            Department cardiology = departmentRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Cardiology"))
                    .findFirst().orElse(null);

            Doctor doctor = new Doctor(null, docUser, "Dr. Sarah Jenkins", "Cardiology Specialist", cardiology, "Mon-Fri: 9AM - 4PM", true);
            doctorRepository.save(doctor);

            // Patient
            User patUser = new User(null, "patient", passwordEncoder.encode("patient123"), "patient@shms.com", Role.ROLE_PATIENT, java.time.LocalDateTime.now());
            userRepository.save(patUser);

            Patient patient = new Patient(null, patUser, "John Doe", 34, "Male", "O+", "123 Main St, New York", "555-0199", "Penicillin", "Mild Hypertension");
            patientRepository.save(patient);

            // Pharmacist
            User pharmaUser = new User(null, "pharmacist", passwordEncoder.encode("pharma123"), "pharmacist@shms.com", Role.ROLE_PHARMACIST, java.time.LocalDateTime.now());
            userRepository.save(pharmaUser);

            // Lab Staff
            User labUser = new User(null, "labstaff", passwordEncoder.encode("lab123"), "lab@shms.com", Role.ROLE_LAB_STAFF, java.time.LocalDateTime.now());
            userRepository.save(labUser);

            // Receptionist
            User recepUser = new User(null, "receptionist", passwordEncoder.encode("recep123"), "recep@shms.com", Role.ROLE_RECEPTIONIST, java.time.LocalDateTime.now());
            userRepository.save(recepUser);
        }
    }
}
