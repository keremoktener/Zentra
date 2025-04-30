package com.zentra.api.service.impl;

import com.zentra.api.dto.AppointmentDto;
import com.zentra.api.dto.CreateAppointmentRequest;
import com.zentra.api.model.Appointment;
import com.zentra.api.model.AppointmentStatus;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.User;
import com.zentra.api.repository.AppointmentRepository;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.repository.UserRepository;
import com.zentra.api.repository.BusinessHoursRepository;
import com.zentra.api.service.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.util.ArrayList;

@Component
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final ServiceRepository serviceRepository;
    private final BusinessHoursRepository businessHoursRepository;

    @Autowired
    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            BusinessProfileRepository businessProfileRepository,
            ServiceRepository serviceRepository,
            BusinessHoursRepository businessHoursRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.serviceRepository = serviceRepository;
        this.businessHoursRepository = businessHoursRepository;
    }

    @Override
    @Transactional
    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        BusinessProfile businessProfile = businessProfileRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));

        com.zentra.api.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setBusiness(businessProfile);
        appointment.setService(service);
        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        
        // Calculate end time based on duration
        LocalTime endTime = request.getStartTime().plusMinutes(request.getDurationMinutes());
        appointment.setEndTime(endTime);
        
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setPrice(service.getPrice());
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(request.getNotes());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDto(savedAppointment);
    }

    @Override
    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        return convertToDto(appointment);
    }

    @Override
    public List<AppointmentDto> getAppointmentsByCustomerId(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        List<Appointment> appointments = appointmentRepository.findByCustomer(customer);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        List<Appointment> appointments = appointmentRepository.findByBusiness(businessProfile);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByStatus(AppointmentStatus status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByCustomerIdAndStatus(Long customerId, AppointmentStatus status) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        List<Appointment> appointments = appointmentRepository.findByCustomerAndStatus(customer, status);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByBusinessIdAndStatus(Long businessId, AppointmentStatus status) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        List<Appointment> appointments = appointmentRepository.findByBusinessAndStatus(businessProfile, status);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByDate(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDate(date);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByBusinessIdAndDate(Long businessId, LocalDate date) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        List<Appointment> appointments = appointmentRepository.findByBusinessAndDate(businessProfile, date);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getUpcomingAppointmentsByCustomerId(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        List<Appointment> appointments = appointmentRepository
                .findByCustomerAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(customer, LocalDate.now());
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getUpcomingAppointmentsByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        List<Appointment> appointments = appointmentRepository
                .findByBusinessAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(businessProfile, LocalDate.now());
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getPastAppointmentsByCustomerId(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        List<Appointment> appointments = appointmentRepository
                .findByCustomerAndDateLessThanOrderByDateDescStartTimeDesc(customer, LocalDate.now());
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getPastAppointmentsByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        List<Appointment> appointments = appointmentRepository
                .findByBusinessAndDateLessThanOrderByDateDescStartTimeDesc(businessProfile, LocalDate.now());
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentDto updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDto(updatedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDto cancelAppointment(Long id, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancellationReason(reason);
        
        Appointment cancelledAppointment = appointmentRepository.save(appointment);
        return convertToDto(cancelledAppointment);
    }

    @Override
    @Transactional
    public AppointmentDto rescheduleAppointment(Long id, LocalDate newDate, String newStartTimeStr) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        
        LocalTime newStartTime = LocalTime.parse(newStartTimeStr, DateTimeFormatter.ofPattern("HH:mm"));
        LocalTime newEndTime = newStartTime.plusMinutes(appointment.getDurationMinutes());
        
        appointment.setDate(newDate);
        appointment.setStartTime(newStartTime);
        appointment.setEndTime(newEndTime);
        
        Appointment rescheduledAppointment = appointmentRepository.save(appointment);
        return convertToDto(rescheduledAppointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new EntityNotFoundException("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    public List<String> getAvailableTimeSlots(Long businessId, Long serviceId, LocalDate date) {
        // Find the business profile
        BusinessProfile business = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
        
        // Find the service
        com.zentra.api.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        // Get the day of week for the requested date
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        
        // Find business hours for this day
        var businessHours = businessHoursRepository.findByBusinessAndDayOfWeek(business, dayOfWeek)
                .orElseThrow(() -> new EntityNotFoundException("Business hours not found for this day"));
        
        // If business is closed on this day, return empty list
        if (!businessHours.isOpen()) {
            return new ArrayList<>();
        }
        
        // Get business open and close times
        LocalTime openTime = businessHours.getOpenTime();
        LocalTime closeTime = businessHours.getCloseTime();
        
        // Get all existing appointments for this business on this date
        List<Appointment> existingAppointments = appointmentRepository.findByBusinessAndDate(business, date);
        
        // Filter out cancelled appointments
        existingAppointments = existingAppointments.stream()
                .filter(appt -> appt.getStatus() != AppointmentStatus.CANCELLED)
                .toList();
        
        // Generate all possible time slots based on service duration
        int durationMinutes = service.getDurationMinutes();
        List<String> availableSlots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        
        // Start at opening time and increment by service duration
        LocalTime currentTime = openTime;
        while (currentTime.plusMinutes(durationMinutes).isBefore(closeTime) || 
               currentTime.plusMinutes(durationMinutes).equals(closeTime)) {
            
            final LocalTime slotStart = currentTime;
            final LocalTime slotEnd = currentTime.plusMinutes(durationMinutes);
            
            // Check if the slot conflicts with any existing appointment
            boolean isAvailable = existingAppointments.stream()
                    .noneMatch(appt -> {
                        // Check if this appointment overlaps with the current slot
                        return (slotStart.isBefore(appt.getEndTime()) && 
                                slotEnd.isAfter(appt.getStartTime()));
                    });
            
            if (isAvailable) {
                availableSlots.add(currentTime.format(formatter));
            }
            
            // Move to next slot (use smaller increments like 15 or 30 minutes depending on your need)
            currentTime = currentTime.plusMinutes(30); // Adjust as needed
        }
        
        return availableSlots;
    }
    
    private AppointmentDto convertToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        
        dto.setCustomerId(appointment.getCustomer().getId());
        dto.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
        dto.setCustomerEmail(appointment.getCustomer().getEmail());
        dto.setCustomerPhone(appointment.getCustomer().getPhoneNumber());
        
        dto.setBusinessId(appointment.getBusiness().getId());
        dto.setBusinessName(appointment.getBusiness().getBusinessName());
        dto.setBusinessAddress(appointment.getBusiness().getAddress());
        dto.setBusinessPhone(appointment.getBusiness().getPhoneNumber());
        
        dto.setServiceId(appointment.getService().getId());
        dto.setServiceName(appointment.getService().getName());
        
        dto.setDate(appointment.getDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setDurationMinutes(appointment.getDurationMinutes());
        dto.setPrice(appointment.getPrice());
        dto.setStatus(appointment.getStatus());
        dto.setNotes(appointment.getNotes());
        dto.setCancellationReason(appointment.getCancellationReason());
        
        return dto;
    }
} 