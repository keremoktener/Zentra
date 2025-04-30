package com.zentra.api.controller;

import com.zentra.api.dto.StaffDto;
import com.zentra.api.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    @Autowired
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> createStaff(@Valid @RequestBody StaffDto staffDto) {
        StaffDto createdStaff = staffService.createStaff(staffDto);
        return new ResponseEntity<>(createdStaff, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> getStaffById(@PathVariable Long id) {
        StaffDto staffDto = staffService.getStaffById(id);
        return ResponseEntity.ok(staffDto);
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<StaffDto>> getStaffByBusinessId(@PathVariable Long businessId) {
        List<StaffDto> staff = staffService.getStaffByBusinessId(businessId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/business/{businessId}/active")
    public ResponseEntity<List<StaffDto>> getActiveStaffByBusinessId(@PathVariable Long businessId) {
        List<StaffDto> staff = staffService.getActiveStaffByBusinessId(businessId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<StaffDto>> getStaffByServiceId(@PathVariable Long serviceId) {
        List<StaffDto> staff = staffService.getStaffByServiceId(serviceId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/business/{businessId}/service/{serviceId}")
    public ResponseEntity<List<StaffDto>> getStaffByBusinessIdAndServiceId(
            @PathVariable Long businessId, 
            @PathVariable Long serviceId) {
        List<StaffDto> staff = staffService.getStaffByBusinessIdAndServiceId(businessId, serviceId);
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffDto staffDto) {
        StaffDto updatedStaff = staffService.updateStaff(id, staffDto);
        return ResponseEntity.ok(updatedStaff);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<Map<String, String>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Staff member deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> toggleStaffActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        StaffDto staffDto = staffService.toggleStaffActive(id, active);
        return ResponseEntity.ok(staffDto);
    }

    @PostMapping("/{staffId}/services/{serviceId}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> addServiceToStaff(
            @PathVariable Long staffId,
            @PathVariable Long serviceId) {
        StaffDto staffDto = staffService.addServiceToStaff(staffId, serviceId);
        return ResponseEntity.ok(staffDto);
    }

    @DeleteMapping("/{staffId}/services/{serviceId}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<StaffDto> removeServiceFromStaff(
            @PathVariable Long staffId,
            @PathVariable Long serviceId) {
        StaffDto staffDto = staffService.removeServiceFromStaff(staffId, serviceId);
        return ResponseEntity.ok(staffDto);
    }
} 