package com.zentra.api.service;

import com.zentra.api.dto.BusinessProfileDto;

import java.util.List;

public interface BusinessProfileService {
    
    // Create a new business profile
    BusinessProfileDto createBusinessProfile(BusinessProfileDto businessProfileDto);
    
    // Get business profile by ID
    BusinessProfileDto getBusinessProfileById(Long id);
    
    // Get business profile by owner ID
    BusinessProfileDto getBusinessProfileByOwnerId(Long ownerId);
    
    // Get all business profiles
    List<BusinessProfileDto> getAllBusinessProfiles();
    
    // Update business profile
    BusinessProfileDto updateBusinessProfile(Long id, BusinessProfileDto businessProfileDto);
    
    // Delete business profile
    void deleteBusinessProfile(Long id);
    
    // Check if a business profile exists for a specific owner
    boolean hasBusinessProfile(Long ownerId);
} 