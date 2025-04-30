package com.zentra.api.repository;

import com.zentra.api.model.BusinessHours;
import com.zentra.api.model.BusinessProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {
    
    // Find business hours by business
    List<BusinessHours> findByBusiness(BusinessProfile business);
    
    // Find business hours by business and day of week
    Optional<BusinessHours> findByBusinessAndDayOfWeek(BusinessProfile business, DayOfWeek dayOfWeek);
    
    // Find business hours by business and isOpen flag
    List<BusinessHours> findByBusinessAndIsOpen(BusinessProfile business, boolean isOpen);
} 