package com.zentra.api.controller;

import com.zentra.api.dto.AppointmentDto;
import com.zentra.api.dto.CreateAppointmentRequest;
import com.zentra.api.model.AppointmentStatus;
import com.zentra.api.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<AppointmentDto> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentDto appointmentDto = appointmentService.createAppointment(request);
        return new ResponseEntity<>(appointmentDto, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_BUSINESS_OWNER')")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
        AppointmentDto appointmentDto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointmentDto);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER') or (hasRole('ROLE_BUSINESS_OWNER') and #customerId == authentication.principal.id)")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByCustomerId(@PathVariable Long customerId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByCustomerId(customerId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/business/{businessId}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByBusinessId(@PathVariable Long businessId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByBusinessId(businessId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/customer/{customerId}/status/{status}")
    @PreAuthorize("hasRole('ROLE_CUSTOMER') or (hasRole('ROLE_BUSINESS_OWNER') and #customerId == authentication.principal.id)")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByCustomerIdAndStatus(
            @PathVariable Long customerId,
            @PathVariable AppointmentStatus status) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByCustomerIdAndStatus(customerId, status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/business/{businessId}/status/{status}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByBusinessIdAndStatus(
            @PathVariable Long businessId,
            @PathVariable AppointmentStatus status) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByBusinessIdAndStatus(businessId, status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/business/{businessId}/date/{date}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByBusinessIdAndDate(
            @PathVariable Long businessId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByBusinessIdAndDate(businessId, date);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/customer/{customerId}/upcoming")
    @PreAuthorize("hasRole('ROLE_CUSTOMER') or (hasRole('ROLE_BUSINESS_OWNER') and #customerId == authentication.principal.id)")
    public ResponseEntity<List<AppointmentDto>> getUpcomingAppointmentsByCustomerId(@PathVariable Long customerId) {
        List<AppointmentDto> appointments = appointmentService.getUpcomingAppointmentsByCustomerId(customerId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/business/{businessId}/upcoming")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getUpcomingAppointmentsByBusinessId(@PathVariable Long businessId) {
        List<AppointmentDto> appointments = appointmentService.getUpcomingAppointmentsByBusinessId(businessId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/customer/{customerId}/past")
    @PreAuthorize("hasRole('ROLE_CUSTOMER') or (hasRole('ROLE_BUSINESS_OWNER') and #customerId == authentication.principal.id)")
    public ResponseEntity<List<AppointmentDto>> getPastAppointmentsByCustomerId(@PathVariable Long customerId) {
        List<AppointmentDto> appointments = appointmentService.getPastAppointmentsByCustomerId(customerId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/business/{businessId}/past")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<List<AppointmentDto>> getPastAppointmentsByBusinessId(@PathVariable Long businessId) {
        List<AppointmentDto> appointments = appointmentService.getPastAppointmentsByBusinessId(businessId);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<AppointmentDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentDto appointmentDto = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(appointmentDto);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_BUSINESS_OWNER')")
    public ResponseEntity<AppointmentDto> cancelAppointment(
            @PathVariable Long id,
            @RequestParam String reason) {
        AppointmentDto appointmentDto = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(appointmentDto);
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_BUSINESS_OWNER')")
    public ResponseEntity<AppointmentDto> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate,
            @RequestParam String newStartTime) {
        AppointmentDto appointmentDto = appointmentService.rescheduleAppointment(id, newDate, newStartTime);
        return ResponseEntity.ok(appointmentDto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Appointment deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<String>> getAvailableTimeSlots(
            @RequestParam Long businessId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> availableSlots = appointmentService.getAvailableTimeSlots(businessId, serviceId, date);
        return ResponseEntity.ok(availableSlots);
    }
} 