package com.zentra.api.repository;

import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    // Find services by business
    List<Service> findByBusiness(BusinessProfile business);
    
    // Find active services by business
    List<Service> findByBusinessAndActiveTrue(BusinessProfile business);
    
    // Find services by name (containing the search term)
    List<Service> findByNameContainingIgnoreCase(String name);
    
    // Find services by business and name (containing the search term)
    List<Service> findByBusinessAndNameContainingIgnoreCase(BusinessProfile business, String name);
    
    // Find services by price range
    List<Service> findByPriceBetween(double minPrice, double maxPrice);
    
    // Find services by business and price range
    List<Service> findByBusinessAndPriceBetween(BusinessProfile business, double minPrice, double maxPrice);
    
    // Find services by duration range (in minutes)
    List<Service> findByDurationMinutesBetween(int minDuration, int maxDuration);
    
    // Find services by business and duration range (in minutes)
    List<Service> findByBusinessAndDurationMinutesBetween(BusinessProfile business, int minDuration, int maxDuration);
} 