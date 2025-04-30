package com.zentra.api.controller;

import com.zentra.api.dto.BusinessProfileDto;
import com.zentra.api.service.BusinessProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/business-profiles")
public class BusinessProfileController {
    
    private static final Logger logger = LoggerFactory.getLogger(BusinessProfileController.class);
    private final BusinessProfileService businessProfileService;

    @Autowired
    public BusinessProfileController(BusinessProfileService businessProfileService) {
        this.businessProfileService = businessProfileService;
    }

    @PostMapping
    //@PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessProfileDto> createBusinessProfile(@Valid @RequestBody BusinessProfileDto businessProfileDto) {
        logAuthenticationDetails("createBusinessProfile");
        BusinessProfileDto createdBusinessProfile = businessProfileService.createBusinessProfile(businessProfileDto);
        return new ResponseEntity<>(createdBusinessProfile, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessProfileDto> getBusinessProfileById(@PathVariable Long id) {
        logAuthenticationDetails("getBusinessProfileById");
        BusinessProfileDto businessProfileDto = businessProfileService.getBusinessProfileById(id);
        return ResponseEntity.ok(businessProfileDto);
    }

    @GetMapping("/owner/{ownerId}")
    //@PreAuthorize("hasRole('ROLE_BUSINESS_OWNER') and #ownerId == authentication.principal.id")
    public ResponseEntity<BusinessProfileDto> getBusinessProfileByOwnerId(@PathVariable Long ownerId) {
        logAuthenticationDetails("getBusinessProfileByOwnerId");
        BusinessProfileDto businessProfileDto = businessProfileService.getBusinessProfileByOwnerId(ownerId);
        return ResponseEntity.ok(businessProfileDto);
    }

    @GetMapping
    public ResponseEntity<List<BusinessProfileDto>> getAllBusinessProfiles() {
        logAuthenticationDetails("getAllBusinessProfiles");
        List<BusinessProfileDto> businessProfiles = businessProfileService.getAllBusinessProfiles();
        return ResponseEntity.ok(businessProfiles);
    }

    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessProfileDto> updateBusinessProfile(
            @PathVariable Long id,
            @Valid @RequestBody BusinessProfileDto businessProfileDto) {
        logAuthenticationDetails("updateBusinessProfile");    
        BusinessProfileDto updatedBusinessProfile = businessProfileService.updateBusinessProfile(id, businessProfileDto);
        return ResponseEntity.ok(updatedBusinessProfile);
    }

    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<Map<String, String>> deleteBusinessProfile(@PathVariable Long id) {
        logAuthenticationDetails("deleteBusinessProfile");
        businessProfileService.deleteBusinessProfile(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Business profile deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/has-profile/{ownerId}")
    //@PreAuthorize("hasRole('ROLE_BUSINESS_OWNER') and #ownerId == authentication.principal.id")
    public ResponseEntity<Map<String, Boolean>> hasBusinessProfile(@PathVariable Long ownerId) {
        logAuthenticationDetails("hasBusinessProfile");
        boolean hasProfile = businessProfileService.hasBusinessProfile(ownerId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasProfile", hasProfile);
        return ResponseEntity.ok(response);
    }
    
    private void logAuthenticationDetails(String methodName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            logger.info("Method: {}, User: {}, Authorities: {}", 
                methodName, auth.getName(), auth.getAuthorities());
        } else {
            logger.warn("Method: {}, No authentication found", methodName);
        }
    }
} 