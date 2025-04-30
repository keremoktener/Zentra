package com.zentra.api.repository;

import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long> {
    
    // Find a business profile by owner
    Optional<BusinessProfile> findByOwner(User owner);
    
    // Find business profiles by name (containing the search term)
    Optional<BusinessProfile> findByBusinessNameContainingIgnoreCase(String businessName);
    
    // Find business profiles by city
    Optional<BusinessProfile> findByCityIgnoreCase(String city);
    
    // Find business profiles by state
    Optional<BusinessProfile> findByStateIgnoreCase(String state);
    
    // Find business profiles by zip code
    Optional<BusinessProfile> findByZipCode(String zipCode);
    
    // Check if a business profile exists for a specific owner
    boolean existsByOwner(User owner);
} 