package com.zentra.api.service;

import com.zentra.api.dto.BusinessListingDto;

import java.util.List;

public interface BusinessListingService {
    
    // Get all business listings for the booking page
    List<BusinessListingDto> getAllBusinessListings();
    
    // Get business listings by category
    List<BusinessListingDto> getBusinessListingsByCategory(String category);
    
    // Search business listings by name
    List<BusinessListingDto> searchBusinessListings(String searchTerm);
} 