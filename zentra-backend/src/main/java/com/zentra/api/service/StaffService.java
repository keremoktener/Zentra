package com.zentra.api.service;

import com.zentra.api.dto.StaffDto;
import java.util.List;

public interface StaffService {
    
    // Create a new staff member
    StaffDto createStaff(StaffDto staffDto);
    
    // Get staff member by ID
    StaffDto getStaffById(Long id);
    
    // Get all staff for a business
    List<StaffDto> getStaffByBusinessId(Long businessId);
    
    // Get active staff for a business
    List<StaffDto> getActiveStaffByBusinessId(Long businessId);
    
    // Get staff for a specific service
    List<StaffDto> getStaffByServiceId(Long serviceId);
    
    // Get staff by business and service
    List<StaffDto> getStaffByBusinessIdAndServiceId(Long businessId, Long serviceId);
    
    // Update staff member
    StaffDto updateStaff(Long id, StaffDto staffDto);
    
    // Delete staff member
    void deleteStaff(Long id);
    
    // Toggle staff active state
    StaffDto toggleStaffActive(Long id, boolean active);
    
    // Add service to staff member
    StaffDto addServiceToStaff(Long staffId, Long serviceId);
    
    // Remove service from staff member
    StaffDto removeServiceFromStaff(Long staffId, Long serviceId);
} 