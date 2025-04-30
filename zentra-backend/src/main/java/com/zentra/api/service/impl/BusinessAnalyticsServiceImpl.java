package com.zentra.api.service.impl;

import com.zentra.api.dto.BusinessAnalyticsDto;
import com.zentra.api.model.Appointment;
import com.zentra.api.model.AppointmentStatus;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.Service;
import com.zentra.api.repository.AppointmentRepository;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.service.BusinessAnalyticsService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class BusinessAnalyticsServiceImpl implements BusinessAnalyticsService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final ServiceRepository serviceRepository;

    @Autowired
    public BusinessAnalyticsServiceImpl(
            AppointmentRepository appointmentRepository,
            BusinessProfileRepository businessProfileRepository,
            ServiceRepository serviceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    public BusinessAnalyticsDto getBusinessAnalytics(Long businessId) {
        // Default to weekly analytics
        return getBusinessWeeklyAnalytics(businessId);
    }

    @Override
    public BusinessAnalyticsDto getBusinessAnalyticsForPeriod(Long businessId, LocalDate startDate, LocalDate endDate) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Get all appointments within the date range
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDateBetween(
                businessProfile, startDate, endDate);

        return buildAnalyticsDto(businessProfile, appointments, startDate, endDate);
    }

    @Override
    public BusinessAnalyticsDto getBusinessDailyAnalytics(Long businessId, LocalDate date) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Get all appointments for the specific date
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDate(businessProfile, date);

        return buildAnalyticsDto(businessProfile, appointments, date, date);
    }

    @Override
    public BusinessAnalyticsDto getBusinessWeeklyAnalytics(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Get start and end of current week (Monday to Sunday)
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // Get all appointments for the week
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDateBetween(
                businessProfile, startOfWeek, endOfWeek);

        return buildAnalyticsDto(businessProfile, appointments, startOfWeek, endOfWeek);
    }

    @Override
    public BusinessAnalyticsDto getBusinessMonthlyAnalytics(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Get start and end of current month
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        // Get all appointments for the month
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDateBetween(
                businessProfile, startOfMonth, endOfMonth);

        return buildAnalyticsDto(businessProfile, appointments, startOfMonth, endOfMonth);
    }

    @Override
    public BusinessAnalyticsDto getBusinessYearlyAnalytics(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Get start and end of current year
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.withDayOfYear(1);
        LocalDate endOfYear = today.with(TemporalAdjusters.lastDayOfYear());

        // Get all appointments for the year
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDateBetween(
                businessProfile, startOfYear, endOfYear);

        return buildAnalyticsDto(businessProfile, appointments, startOfYear, endOfYear);
    }

    private BusinessAnalyticsDto buildAnalyticsDto(
            BusinessProfile businessProfile, 
            List<Appointment> appointments,
            LocalDate startDate,
            LocalDate endDate) {
        
        BusinessAnalyticsDto dto = new BusinessAnalyticsDto();
        dto.setBusinessId(businessProfile.getId());
        dto.setBusinessName(businessProfile.getBusinessName());
        
        // Today's date
        LocalDate today = LocalDate.now();
        
        // Today's appointments
        int todayAppointments = (int) appointments.stream()
                .filter(appointment -> appointment.getDate().equals(today))
                .count();
        dto.setTotalAppointmentsToday(todayAppointments);
        
        // Total appointments for the period
        dto.setTotalAppointmentsThisWeek(appointments.size());
        
        // New bookings for the period (created within the period)
        int newBookings = (int) appointments.stream()
                .filter(appointment -> appointment.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) 
                        && appointment.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
                .count();
        dto.setNewBookingsThisWeek(newBookings);
        
        // Cancelled appointments for the period
        int cancelledAppointments = (int) appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.CANCELLED)
                .count();
        dto.setCancelledAppointmentsThisWeek(cancelledAppointments);
        
        // Revenue for the period (only confirmed and completed appointments)
        BigDecimal totalRevenue = appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.CONFIRMED 
                        || appointment.getStatus() == AppointmentStatus.COMPLETED)
                .map(Appointment::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setRevenueThisWeek(totalRevenue);
        
        // Daily revenue for the period
        Map<String, BigDecimal> dailyRevenue = new LinkedHashMap<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            BigDecimal revenue = appointments.stream()
                    .filter(appointment -> appointment.getDate().equals(currentDate)
                            && (appointment.getStatus() == AppointmentStatus.CONFIRMED 
                                || appointment.getStatus() == AppointmentStatus.COMPLETED))
                    .map(Appointment::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyRevenue.put(currentDate.toString(), revenue);
        }
        dto.setDailyRevenue(dailyRevenue);
        
        // Appointments by status
        Map<String, Integer> appointmentsByStatus = new HashMap<>();
        Arrays.stream(AppointmentStatus.values()).forEach(status -> {
            int count = (int) appointments.stream()
                    .filter(appointment -> appointment.getStatus() == status)
                    .count();
            appointmentsByStatus.put(status.name(), count);
        });
        dto.setAppointmentsByStatus(appointmentsByStatus);
        
        // Top services by booking count
        Map<Service, Integer> serviceCountMap = new HashMap<>();
        Map<Service, BigDecimal> serviceRevenueMap = new HashMap<>();
        
        appointments.forEach(appointment -> {
            Service service = appointment.getService();
            serviceCountMap.put(service, serviceCountMap.getOrDefault(service, 0) + 1);
            
            if (appointment.getStatus() == AppointmentStatus.CONFIRMED 
                    || appointment.getStatus() == AppointmentStatus.COMPLETED) {
                BigDecimal currentRevenue = serviceRevenueMap.getOrDefault(service, BigDecimal.ZERO);
                serviceRevenueMap.put(service, currentRevenue.add(appointment.getPrice()));
            }
        });
        
        List<BusinessAnalyticsDto.ServiceStatsDto> topServices = serviceCountMap.entrySet().stream()
                .map(entry -> {
                    BusinessAnalyticsDto.ServiceStatsDto statsDto = new BusinessAnalyticsDto.ServiceStatsDto();
                    statsDto.setServiceId(entry.getKey().getId());
                    statsDto.setServiceName(entry.getKey().getName());
                    statsDto.setBookingCount(entry.getValue());
                    statsDto.setRevenue(serviceRevenueMap.getOrDefault(entry.getKey(), BigDecimal.ZERO));
                    return statsDto;
                })
                .sorted(Comparator.comparing(BusinessAnalyticsDto.ServiceStatsDto::getBookingCount).reversed())
                .limit(5)  // Top 5 services
                .collect(Collectors.toList());
        
        dto.setTopServices(topServices);
        
        // Customer statistics - unique customers
        Set<Long> customerIds = appointments.stream()
                .map(appointment -> appointment.getCustomer().getId())
                .collect(Collectors.toSet());
        
        dto.setTotalCustomers(customerIds.size());
        
        // New customers (first appointment within the period)
        Set<Long> newCustomerIds = appointments.stream()
                .filter(appointment -> appointment.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) 
                        && appointment.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
                .map(appointment -> appointment.getCustomer().getId())
                .collect(Collectors.toSet());
        
        dto.setNewCustomersThisWeek(newCustomerIds.size());
        
        // Returning customers
        Set<Long> returningCustomers = new HashSet<>(customerIds);
        returningCustomers.removeAll(newCustomerIds);
        dto.setReturningCustomersThisWeek(returningCustomers.size());
        
        return dto;
    }
} 