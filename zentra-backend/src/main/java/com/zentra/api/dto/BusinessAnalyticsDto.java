package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessAnalyticsDto {
    private Long businessId;
    private String businessName;
    
    // Summary metrics
    private int totalAppointmentsToday;
    private int totalAppointmentsThisWeek;
    private int newBookingsThisWeek;
    private int cancelledAppointmentsThisWeek;
    private BigDecimal revenueThisWeek;
    
    // Daily revenue for the week
    private Map<String, BigDecimal> dailyRevenue;
    
    // Appointments by status
    private Map<String, Integer> appointmentsByStatus;
    
    // Top services by booking count
    private List<ServiceStatsDto> topServices;
    
    // Customer statistics
    private int totalCustomers;
    private int newCustomersThisWeek;
    private int returningCustomersThisWeek;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceStatsDto {
        private Long serviceId;
        private String serviceName;
        private int bookingCount;
        private BigDecimal revenue;
    }
} 