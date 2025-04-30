package com.zentra.api.service;

import com.zentra.api.dto.ServiceDto;

import java.util.List;

public interface ServiceManager {
    
    // Create a new service
    ServiceDto createService(ServiceDto serviceDto);
    
    // Get service by ID
    ServiceDto getServiceById(Long id);
    
    // Get all services for a business
    List<ServiceDto> getServicesByBusinessId(Long businessId);
    
    // Get active services for a business
    List<ServiceDto> getActiveServicesByBusinessId(Long businessId);
    
    // Update service
    ServiceDto updateService(Long id, ServiceDto serviceDto);
    
    // Delete service
    void deleteService(Long id);
    
    // Activate/deactivate service
    ServiceDto toggleServiceActive(Long id, boolean active);
} 