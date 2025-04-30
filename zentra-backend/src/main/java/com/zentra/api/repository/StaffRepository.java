package com.zentra.api.repository;

import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.Service;
import com.zentra.api.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    // Find staff by business
    List<Staff> findByBusiness(BusinessProfile business);
    
    // Find active staff by business
    List<Staff> findByBusinessAndActiveTrue(BusinessProfile business);
    
    // Find staff by service
    List<Staff> findByServicesContaining(Service service);
    
    // Find staff by business and service
    List<Staff> findByBusinessAndServicesContaining(BusinessProfile business, Service service);
    
    // Find staff by name (containing search term)
    List<Staff> findByBusinessAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        BusinessProfile business, String firstName, String lastName);
} 