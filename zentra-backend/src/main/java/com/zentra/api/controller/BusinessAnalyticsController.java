package com.zentra.api.controller;

import com.zentra.api.dto.BusinessAnalyticsDto;
import com.zentra.api.service.BusinessAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/business-analytics")
public class BusinessAnalyticsController {

    private final BusinessAnalyticsService businessAnalyticsService;

    @Autowired
    public BusinessAnalyticsController(BusinessAnalyticsService businessAnalyticsService) {
        this.businessAnalyticsService = businessAnalyticsService;
    }

    @GetMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessAnalytics(@PathVariable Long businessId) {
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessAnalytics(businessId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{businessId}/period")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessAnalyticsForPeriod(
            @PathVariable Long businessId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessAnalyticsForPeriod(
                businessId, startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{businessId}/daily")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessDailyAnalytics(
            @PathVariable Long businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now();
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessDailyAnalytics(businessId, targetDate);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{businessId}/weekly")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessWeeklyAnalytics(@PathVariable Long businessId) {
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessWeeklyAnalytics(businessId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{businessId}/monthly")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessMonthlyAnalytics(@PathVariable Long businessId) {
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessMonthlyAnalytics(businessId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{businessId}/yearly")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessYearlyAnalytics(@PathVariable Long businessId) {
        BusinessAnalyticsDto analytics = businessAnalyticsService.getBusinessYearlyAnalytics(businessId);
        return ResponseEntity.ok(analytics);
    }
} 