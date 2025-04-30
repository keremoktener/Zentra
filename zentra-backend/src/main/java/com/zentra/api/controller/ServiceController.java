package com.zentra.api.controller;

import com.zentra.api.dto.ServiceDto;
import com.zentra.api.service.ServiceManager;
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
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceManager serviceManager;

    @Autowired
    public ServiceController(ServiceManager serviceManager) {
        this.serviceManager = serviceManager;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody ServiceDto serviceDto) {
        ServiceDto createdService = serviceManager.createService(serviceDto);
        return new ResponseEntity<>(createdService, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDto> getServiceById(@PathVariable Long id) {
        ServiceDto serviceDto = serviceManager.getServiceById(id);
        return ResponseEntity.ok(serviceDto);
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<ServiceDto>> getServicesByBusinessId(@PathVariable Long businessId) {
        List<ServiceDto> services = serviceManager.getServicesByBusinessId(businessId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/business/{businessId}/active")
    public ResponseEntity<List<ServiceDto>> getActiveServicesByBusinessId(@PathVariable Long businessId) {
        List<ServiceDto> services = serviceManager.getActiveServicesByBusinessId(businessId);
        return ResponseEntity.ok(services);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<ServiceDto> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceDto serviceDto) {
        ServiceDto updatedService = serviceManager.updateService(id, serviceDto);
        return ResponseEntity.ok(updatedService);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Long id) {
        serviceManager.deleteService(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Service deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ROLE_BUSINESS_OWNER')")
    public ResponseEntity<ServiceDto> toggleServiceActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ServiceDto serviceDto = serviceManager.toggleServiceActive(id, active);
        return ResponseEntity.ok(serviceDto);
    }
} 