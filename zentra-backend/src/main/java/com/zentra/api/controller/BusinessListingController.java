package com.zentra.api.controller;

import com.zentra.api.dto.BusinessListingDto;
import com.zentra.api.service.BusinessListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/business-listings")
public class BusinessListingController {

    private final BusinessListingService businessListingService;

    @Autowired
    public BusinessListingController(BusinessListingService businessListingService) {
        this.businessListingService = businessListingService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessListingDto>> getAllBusinessListings() {
        List<BusinessListingDto> businessListings = businessListingService.getAllBusinessListings();
        return ResponseEntity.ok(businessListings);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<BusinessListingDto>> getBusinessListingsByCategory(
            @PathVariable String category) {
        List<BusinessListingDto> businessListings = businessListingService.getBusinessListingsByCategory(category);
        return ResponseEntity.ok(businessListings);
    }

    @GetMapping("/search")
    public ResponseEntity<List<BusinessListingDto>> searchBusinessListings(
            @RequestParam String query) {
        List<BusinessListingDto> businessListings = businessListingService.searchBusinessListings(query);
        return ResponseEntity.ok(businessListings);
    }
} 