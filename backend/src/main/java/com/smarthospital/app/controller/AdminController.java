package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingRepository billingRepository;
    private final InventoryRepository inventoryRepository;
    private final DepartmentRepository departmentRepository;

    public AdminController(PatientRepository patientRepository, DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository, BillingRepository billingRepository,
                           InventoryRepository inventoryRepository, DepartmentRepository departmentRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billingRepository = billingRepository;
        this.inventoryRepository = inventoryRepository;
        this.departmentRepository = departmentRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        
        long lowStockCount = inventoryRepository.findLowStockItems().size();
        stats.put("lowStockAlerts", lowStockCount);

        // Calculate total revenue from paid bills
        BigDecimal revenue = billingRepository.findByStatus("PAID").stream()
                .map(Billing::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", revenue);

        // Pending appointments count
        long pendingAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus().equals("PENDING"))
                .count();
        stats.put("pendingAppointments", pendingAppointments);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<Inventory>> getInventory() {
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @PostMapping("/inventory")
    public ResponseEntity<Inventory> addInventoryItem(@RequestBody Inventory item) {
        if (item.getQuantity() <= item.getThreshold()) {
            item.setStatus("LOW_STOCK");
        } else if (item.getQuantity() == 0) {
            item.setStatus("OUT_OF_STOCK");
        } else {
            item.setStatus("IN_STOCK");
        }
        return ResponseEntity.ok(inventoryRepository.save(item));
    }

    @PutMapping("/inventory/{id}/restock")
    public ResponseEntity<Inventory> restockInventoryItem(@PathVariable Long id, @RequestParam Integer quantity) {
        Inventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        item.setQuantity(item.getQuantity() + quantity);
        
        if (item.getQuantity() <= item.getThreshold()) {
            item.setStatus("LOW_STOCK");
        } else {
            item.setStatus("IN_STOCK");
        }
        return ResponseEntity.ok(inventoryRepository.save(item));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department dept) {
        return ResponseEntity.ok(departmentRepository.save(dept));
    }
}
