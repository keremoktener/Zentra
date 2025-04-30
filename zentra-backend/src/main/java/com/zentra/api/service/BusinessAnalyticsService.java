package com.zentra.api.service;

import com.zentra.api.dto.BusinessAnalyticsDto;
import java.time.LocalDate;

public interface BusinessAnalyticsService {
    
    // Get analytics for a business
    BusinessAnalyticsDto getBusinessAnalytics(Long businessId);
    
    // Get analytics for a business for a specific period
    BusinessAnalyticsDto getBusinessAnalyticsForPeriod(Long businessId, LocalDate startDate, LocalDate endDate);
    
    // Get daily analytics for a specific date
    BusinessAnalyticsDto getBusinessDailyAnalytics(Long businessId, LocalDate date);
    
    // Get weekly analytics (default is current week)
    BusinessAnalyticsDto getBusinessWeeklyAnalytics(Long businessId);
    
    // Get monthly analytics (default is current month)
    BusinessAnalyticsDto getBusinessMonthlyAnalytics(Long businessId);
    
    // Get yearly analytics (default is current year)
    BusinessAnalyticsDto getBusinessYearlyAnalytics(Long businessId);
} 