package com.smarthospital.app.repository;

import com.smarthospital.app.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.threshold")
    List<Inventory> findLowStockItems();
}
