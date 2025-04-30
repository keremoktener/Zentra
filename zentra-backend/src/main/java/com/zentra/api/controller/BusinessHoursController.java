package com.zentra.api.controller;

import com.zentra.api.dto.BusinessHoursDto;
import com.zentra.api.service.BusinessHoursService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;

    @Autowired
    public BusinessHoursController(BusinessHoursService businessHoursService) {
        this.businessHoursService = businessHoursService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessHoursDto> createBusinessHours(@Valid @RequestBody BusinessHoursDto businessHoursDto) {
        BusinessHoursDto createdBusinessHours = businessHoursService.createBusinessHours(businessHoursDto);
        return new ResponseEntity<>(createdBusinessHours, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessHoursDto> getBusinessHoursById(@PathVariable Long id) {
        BusinessHoursDto businessHoursDto = businessHoursService.getBusinessHoursById(id);
        return ResponseEntity.ok(businessHoursDto);
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<BusinessHoursDto>> getBusinessHoursByBusinessId(@PathVariable Long businessId) {
        List<BusinessHoursDto> businessHours = businessHoursService.getBusinessHoursByBusinessId(businessId);
        return ResponseEntity.ok(businessHours);
    }

    @GetMapping("/business/{businessId}/day/{dayOfWeek}")
    public ResponseEntity<BusinessHoursDto> getBusinessHoursByBusinessIdAndDayOfWeek(
            @PathVariable Long businessId,
            @PathVariable DayOfWeek dayOfWeek) {
        BusinessHoursDto businessHoursDto = businessHoursService.getBusinessHoursByBusinessIdAndDayOfWeek(businessId, dayOfWeek);
        return ResponseEntity.ok(businessHoursDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessHoursDto> updateBusinessHours(
            @PathVariable Long id,
            @Valid @RequestBody BusinessHoursDto businessHoursDto) {
        BusinessHoursDto updatedBusinessHours = businessHoursService.updateBusinessHours(id, businessHoursDto);
        return ResponseEntity.ok(updatedBusinessHours);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<Map<String, String>> deleteBusinessHours(@PathVariable Long id) {
        businessHoursService.deleteBusinessHours(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Business hours deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/open")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessHoursDto> toggleBusinessHoursOpen(
            @PathVariable Long id,
            @RequestParam boolean isOpen) {
        BusinessHoursDto businessHoursDto = businessHoursService.toggleBusinessHoursOpen(id, isOpen);
        return ResponseEntity.ok(businessHoursDto);
    }
} 