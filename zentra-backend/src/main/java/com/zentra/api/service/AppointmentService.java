package com.zentra.api.service;

import com.zentra.api.dto.AppointmentDto;
import com.zentra.api.dto.CreateAppointmentRequest;
import com.zentra.api.model.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    
    // Create a new appointment
    AppointmentDto createAppointment(CreateAppointmentRequest request);
    
    // Get appointment by ID
    AppointmentDto getAppointmentById(Long id);
    
    // Get all appointments for a customer
    List<AppointmentDto> getAppointmentsByCustomerId(Long customerId);
    
    // Get all appointments for a business
    List<AppointmentDto> getAppointmentsByBusinessId(Long businessId);
    
    // Get appointments by status
    List<AppointmentDto> getAppointmentsByStatus(AppointmentStatus status);
    
    // Get appointments by customer and status
    List<AppointmentDto> getAppointmentsByCustomerIdAndStatus(Long customerId, AppointmentStatus status);
    
    // Get appointments by business and status
    List<AppointmentDto> getAppointmentsByBusinessIdAndStatus(Long businessId, AppointmentStatus status);
    
    // Get appointments by date
    List<AppointmentDto> getAppointmentsByDate(LocalDate date);
    
    // Get appointments by business and date
    List<AppointmentDto> getAppointmentsByBusinessIdAndDate(Long businessId, LocalDate date);
    
    // Get upcoming appointments for a customer
    List<AppointmentDto> getUpcomingAppointmentsByCustomerId(Long customerId);
    
    // Get upcoming appointments for a business
    List<AppointmentDto> getUpcomingAppointmentsByBusinessId(Long businessId);
    
    // Get past appointments for a customer
    List<AppointmentDto> getPastAppointmentsByCustomerId(Long customerId);
    
    // Get past appointments for a business
    List<AppointmentDto> getPastAppointmentsByBusinessId(Long businessId);
    
    // Update appointment status
    AppointmentDto updateAppointmentStatus(Long id, AppointmentStatus status);
    
    // Cancel appointment
    AppointmentDto cancelAppointment(Long id, String reason);
    
    // Reschedule appointment
    AppointmentDto rescheduleAppointment(Long id, LocalDate newDate, String newStartTime);
    
    // Delete appointment
    void deleteAppointment(Long id);
    
    // Get available time slots for a service on a specific date
    List<String> getAvailableTimeSlots(Long businessId, Long serviceId, LocalDate date);
} 