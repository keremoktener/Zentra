package com.zentra.api.service.impl;

import com.zentra.api.dto.ServiceDto;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.service.ServiceManager;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ServiceManagerImpl implements ServiceManager {

    private final ServiceRepository serviceRepository;
    private final BusinessProfileRepository businessProfileRepository;

    @Autowired
    public ServiceManagerImpl(
            ServiceRepository serviceRepository,
            BusinessProfileRepository businessProfileRepository) {
        this.serviceRepository = serviceRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Override
    @Transactional
    public ServiceDto createService(ServiceDto serviceDto) {
        BusinessProfile businessProfile = businessProfileRepository.findById(serviceDto.getBusinessId())
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        com.zentra.api.model.Service service = new com.zentra.api.model.Service();
        service.setBusiness(businessProfile);
        service.setName(serviceDto.getName());
        service.setDescription(serviceDto.getDescription());
        service.setDurationMinutes(serviceDto.getDurationMinutes());
        service.setPrice(serviceDto.getPrice());
        service.setImageUrl(serviceDto.getImageUrl());
        service.setActive(serviceDto.isActive());
        
        com.zentra.api.model.Service savedService = serviceRepository.save(service);
        return convertToDto(savedService);
    }

    @Override
    public ServiceDto getServiceById(Long id) {
        com.zentra.api.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        return convertToDto(service);
    }

    @Override
    public List<ServiceDto> getServicesByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        List<com.zentra.api.model.Service> services = serviceRepository.findByBusiness(businessProfile);
        return services.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<ServiceDto> getActiveServicesByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        List<com.zentra.api.model.Service> services = serviceRepository.findByBusinessAndActiveTrue(businessProfile);
        return services.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceDto updateService(Long id, ServiceDto serviceDto) {
        com.zentra.api.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        service.setName(serviceDto.getName());
        service.setDescription(serviceDto.getDescription());
        service.setDurationMinutes(serviceDto.getDurationMinutes());
        service.setPrice(serviceDto.getPrice());
        service.setImageUrl(serviceDto.getImageUrl());
        service.setActive(serviceDto.isActive());
        service.setUpdatedAt(LocalDateTime.now());
        
        com.zentra.api.model.Service updatedService = serviceRepository.save(service);
        return convertToDto(updatedService);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new EntityNotFoundException("Service not found");
        }
        serviceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ServiceDto toggleServiceActive(Long id, boolean active) {
        com.zentra.api.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        service.setActive(active);
        service.setUpdatedAt(LocalDateTime.now());
        
        com.zentra.api.model.Service updatedService = serviceRepository.save(service);
        return convertToDto(updatedService);
    }
    
    private ServiceDto convertToDto(com.zentra.api.model.Service service) {
        ServiceDto dto = new ServiceDto();
        dto.setId(service.getId());
        dto.setBusinessId(service.getBusiness().getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setPrice(service.getPrice());
        dto.setImageUrl(service.getImageUrl());
        dto.setActive(service.isActive());
        return dto;
    }
} 