package com.zentra.api.service;

import com.zentra.api.dto.BusinessHoursDto;

import java.time.DayOfWeek;
import java.util.List;

public interface BusinessHoursService {
    
    // Create business hours
    BusinessHoursDto createBusinessHours(BusinessHoursDto businessHoursDto);
    
    // Get business hours by ID
    BusinessHoursDto getBusinessHoursById(Long id);
    
    // Get all business hours for a business
    List<BusinessHoursDto> getBusinessHoursByBusinessId(Long businessId);
    
    // Get business hours for a specific day
    BusinessHoursDto getBusinessHoursByBusinessIdAndDayOfWeek(Long businessId, DayOfWeek dayOfWeek);
    
    // Update business hours
    BusinessHoursDto updateBusinessHours(Long id, BusinessHoursDto businessHoursDto);
    
    // Delete business hours
    void deleteBusinessHours(Long id);
    
    // Toggle business hours open/closed
    BusinessHoursDto toggleBusinessHoursOpen(Long id, boolean isOpen);
} 