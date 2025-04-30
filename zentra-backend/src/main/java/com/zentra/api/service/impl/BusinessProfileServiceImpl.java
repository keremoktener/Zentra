package com.zentra.api.service.impl;

import com.zentra.api.dto.BusinessHoursDto;
import com.zentra.api.dto.BusinessProfileDto;
import com.zentra.api.dto.ServiceDto;
import com.zentra.api.model.BusinessHours;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.User;
import com.zentra.api.repository.BusinessHoursRepository;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.repository.UserRepository;
import com.zentra.api.service.BusinessProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BusinessProfileServiceImpl implements BusinessProfileService {

    private final BusinessProfileRepository businessProfileRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final BusinessHoursRepository businessHoursRepository;

    @Autowired
    public BusinessProfileServiceImpl(
            BusinessProfileRepository businessProfileRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository,
            BusinessHoursRepository businessHoursRepository) {
        this.businessProfileRepository = businessProfileRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.businessHoursRepository = businessHoursRepository;
    }

    @Override
    @Transactional
    public BusinessProfileDto createBusinessProfile(BusinessProfileDto businessProfileDto) {
        User owner = userRepository.findById(businessProfileDto.getOwnerId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        BusinessProfile businessProfile = new BusinessProfile();
        businessProfile.setOwner(owner);
        businessProfile.setBusinessName(businessProfileDto.getBusinessName());
        businessProfile.setDescription(businessProfileDto.getDescription());
        businessProfile.setAddress(businessProfileDto.getAddress());
        businessProfile.setCity(businessProfileDto.getCity());
        businessProfile.setState(businessProfileDto.getState());
        businessProfile.setZipCode(businessProfileDto.getZipCode());
        businessProfile.setPhoneNumber(businessProfileDto.getPhoneNumber());
        businessProfile.setWebsite(businessProfileDto.getWebsite());
        businessProfile.setLogoUrl(businessProfileDto.getLogoUrl());
        businessProfile.setActive(businessProfileDto.isActive());

        BusinessProfile savedBusinessProfile = businessProfileRepository.save(businessProfile);
        return convertToDto(savedBusinessProfile);
    }

    @Override
    public BusinessProfileDto getBusinessProfileById(Long id) {
        BusinessProfile businessProfile = businessProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        return convertToDto(businessProfile);
    }

    @Override
    public BusinessProfileDto getBusinessProfileByOwnerId(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        BusinessProfile businessProfile = businessProfileRepository.findByOwner(owner)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found for this owner"));
        return convertToDto(businessProfile);
    }

    @Override
    public List<BusinessProfileDto> getAllBusinessProfiles() {
        List<BusinessProfile> businessProfiles = businessProfileRepository.findAll();
        return businessProfiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BusinessProfileDto updateBusinessProfile(Long id, BusinessProfileDto businessProfileDto) {
        BusinessProfile businessProfile = businessProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));

        // Update basic info
        businessProfile.setBusinessName(businessProfileDto.getBusinessName());
        businessProfile.setDescription(businessProfileDto.getDescription());
        businessProfile.setAddress(businessProfileDto.getAddress());
        businessProfile.setCity(businessProfileDto.getCity());
        businessProfile.setState(businessProfileDto.getState());
        businessProfile.setZipCode(businessProfileDto.getZipCode());
        businessProfile.setPhoneNumber(businessProfileDto.getPhoneNumber());
        businessProfile.setWebsite(businessProfileDto.getWebsite());
        businessProfile.setLogoUrl(businessProfileDto.getLogoUrl());
        businessProfile.setActive(businessProfileDto.isActive());
        businessProfile.setUpdatedAt(LocalDateTime.now());

        BusinessProfile updatedBusinessProfile = businessProfileRepository.save(businessProfile);
        return convertToDto(updatedBusinessProfile);
    }

    @Override
    @Transactional
    public void deleteBusinessProfile(Long id) {
        if (!businessProfileRepository.existsById(id)) {
            throw new EntityNotFoundException("Business profile not found");
        }
        businessProfileRepository.deleteById(id);
    }

    @Override
    public boolean hasBusinessProfile(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return businessProfileRepository.existsByOwner(owner);
    }

    private BusinessProfileDto convertToDto(BusinessProfile businessProfile) {
        BusinessProfileDto dto = new BusinessProfileDto();
        dto.setId(businessProfile.getId());
        dto.setOwnerId(businessProfile.getOwner().getId());
        dto.setOwnerName(businessProfile.getOwner().getFirstName() + " " + businessProfile.getOwner().getLastName());
        dto.setOwnerEmail(businessProfile.getOwner().getEmail());
        dto.setBusinessName(businessProfile.getBusinessName());
        dto.setDescription(businessProfile.getDescription());
        dto.setAddress(businessProfile.getAddress());
        dto.setCity(businessProfile.getCity());
        dto.setState(businessProfile.getState());
        dto.setZipCode(businessProfile.getZipCode());
        dto.setPhoneNumber(businessProfile.getPhoneNumber());
        dto.setWebsite(businessProfile.getWebsite());
        dto.setLogoUrl(businessProfile.getLogoUrl());
        dto.setActive(businessProfile.isActive());

        // Convert services
        List<com.zentra.api.model.Service> services = serviceRepository.findByBusiness(businessProfile);
        List<ServiceDto> serviceDtos = services.stream()
                .map(this::convertServiceToDto)
                .collect(Collectors.toList());
        dto.setServices(serviceDtos);

        // Convert business hours
        List<BusinessHours> businessHours = businessHoursRepository.findByBusiness(businessProfile);
        List<BusinessHoursDto> businessHoursDtos = businessHours.stream()
                .map(this::convertBusinessHoursToDto)
                .collect(Collectors.toList());
        dto.setBusinessHours(businessHoursDtos);

        return dto;
    }

    private ServiceDto convertServiceToDto(com.zentra.api.model.Service service) {
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

    private BusinessHoursDto convertBusinessHoursToDto(BusinessHours businessHours) {
        BusinessHoursDto dto = new BusinessHoursDto();
        dto.setId(businessHours.getId());
        dto.setBusinessId(businessHours.getBusiness().getId());
        dto.setDayOfWeek(businessHours.getDayOfWeek());
        dto.setOpenTime(businessHours.getOpenTime());
        dto.setCloseTime(businessHours.getCloseTime());
        dto.setOpen(businessHours.isOpen());
        return dto;
    }

    
} 