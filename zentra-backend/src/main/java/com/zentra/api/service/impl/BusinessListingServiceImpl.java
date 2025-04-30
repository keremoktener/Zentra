package com.zentra.api.service.impl;

import com.zentra.api.dto.BusinessListingDto;
import com.zentra.api.dto.ServiceListingDto;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.Service;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.service.BusinessListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BusinessListingServiceImpl implements BusinessListingService {

    private final BusinessProfileRepository businessProfileRepository;
    private final ServiceRepository serviceRepository;

    @Autowired
    public BusinessListingServiceImpl(
            BusinessProfileRepository businessProfileRepository,
            ServiceRepository serviceRepository) {
        this.businessProfileRepository = businessProfileRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<BusinessListingDto> getAllBusinessListings() {
        List<BusinessProfile> businessProfiles = businessProfileRepository.findAll();
        return businessProfiles.stream()
                .filter(BusinessProfile::isActive)
                .map(this::convertToBusinessListingDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusinessListingDto> getBusinessListingsByCategory(String category) {
        // For now, we'll filter all businesses by category
        // In a real application, you'd have a category field in the BusinessProfile entity
        // and query directly from the database
        return getAllBusinessListings().stream()
                .filter(business -> category.equalsIgnoreCase("All") || 
                                    category.equalsIgnoreCase(business.getCategory()))
                .collect(Collectors.toList());
    }

    @Override
    public List<BusinessListingDto> searchBusinessListings(String searchTerm) {
        return getAllBusinessListings().stream()
                .filter(business -> business.getName().toLowerCase().contains(searchTerm.toLowerCase()))
                .collect(Collectors.toList());
    }

    private BusinessListingDto convertToBusinessListingDto(BusinessProfile businessProfile) {
        BusinessListingDto dto = new BusinessListingDto();
        dto.setId(businessProfile.getId());
        dto.setName(businessProfile.getBusinessName());
        
        // Set a default category based on business description or name
        // In a real application, you would have a category field in the BusinessProfile entity
        String category = determineCategory(businessProfile);
        dto.setCategory(category);
        
        // Set a default rating
        // In a real application, you would calculate this from customer reviews
        dto.setRating(4.5);
        
        // Set a default image
        // In a real application, you would store and retrieve actual business images
        dto.setImage(businessProfile.getLogoUrl() != null ? 
                businessProfile.getLogoUrl() : 
                "https://via.placeholder.com/500?text=" + businessProfile.getBusinessName());
        
        // Get active services for this business
        List<Service> services = serviceRepository.findByBusinessAndActiveTrue(businessProfile);
        List<ServiceListingDto> serviceListingDtos = services.stream()
                .map(this::convertToServiceListingDto)
                .collect(Collectors.toList());
        dto.setServices(serviceListingDtos);
        
        return dto;
    }
    
    private ServiceListingDto convertToServiceListingDto(Service service) {
        ServiceListingDto dto = new ServiceListingDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDuration(service.getDurationMinutes());
        dto.setPrice(service.getPrice().doubleValue());
        return dto;
    }
    
    private String determineCategory(BusinessProfile businessProfile) {
        // This is a simple implementation to determine category based on business name or description
        // In a real application, you would have a proper category field
        String name = businessProfile.getBusinessName().toLowerCase();
        String description = businessProfile.getDescription() != null ? 
                businessProfile.getDescription().toLowerCase() : "";
        
        if (name.contains("spa") || name.contains("massage") || name.contains("wellness") ||
            description.contains("spa") || description.contains("massage") || description.contains("wellness")) {
            return "Wellness";
        } else if (name.contains("salon") || name.contains("hair") || name.contains("beauty") || name.contains("nail") ||
                 description.contains("salon") || description.contains("hair") || description.contains("beauty") || 
                 description.contains("nail")) {
            return "Beauty";
        } else if (name.contains("gym") || name.contains("fitness") || name.contains("training") ||
                 description.contains("gym") || description.contains("fitness") || description.contains("training")) {
            return "Fitness";
        } else {
            return "Other";
        }
    }
} 