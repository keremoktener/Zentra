package com.zentra.api.service.impl;

import com.zentra.api.dto.BusinessHoursDto;
import com.zentra.api.model.BusinessHours;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.repository.BusinessHoursRepository;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.service.BusinessHoursService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BusinessHoursServiceImpl implements BusinessHoursService {

    private final BusinessHoursRepository businessHoursRepository;
    private final BusinessProfileRepository businessProfileRepository;

    @Autowired
    public BusinessHoursServiceImpl(
            BusinessHoursRepository businessHoursRepository,
            BusinessProfileRepository businessProfileRepository) {
        this.businessHoursRepository = businessHoursRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Override
    @Transactional
    public BusinessHoursDto createBusinessHours(BusinessHoursDto businessHoursDto) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessHoursDto.getBusinessId())
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        // Check if hours for this day already exist
        businessHoursRepository.findByBusinessAndDayOfWeek(businessProfile, businessHoursDto.getDayOfWeek())
                .ifPresent(hours -> {
                    throw new IllegalStateException("Business hours for this day already exist");
                });
        
        BusinessHours businessHours = new BusinessHours();
        businessHours.setBusiness(businessProfile);
        businessHours.setDayOfWeek(businessHoursDto.getDayOfWeek());
        businessHours.setOpenTime(businessHoursDto.getOpenTime());
        businessHours.setCloseTime(businessHoursDto.getCloseTime());
        businessHours.setOpen(businessHoursDto.isOpen());
        
        BusinessHours savedBusinessHours = businessHoursRepository.save(businessHours);
        return convertToDto(savedBusinessHours);
    }

    @Override
    public BusinessHoursDto getBusinessHoursById(Long id) {
        BusinessHours businessHours = businessHoursRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business hours not found"));
        return convertToDto(businessHours);
    }

    @Override
    public List<BusinessHoursDto> getBusinessHoursByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        List<BusinessHours> businessHours = businessHoursRepository.findByBusiness(businessProfile);
        return businessHours.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public BusinessHoursDto getBusinessHoursByBusinessIdAndDayOfWeek(Long businessId, DayOfWeek dayOfWeek) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        BusinessHours businessHours = businessHoursRepository.findByBusinessAndDayOfWeek(businessProfile, dayOfWeek)
                .orElseThrow(() -> new EntityNotFoundException("Business hours not found for this day"));
        
        return convertToDto(businessHours);
    }

    @Override
    @Transactional
    public BusinessHoursDto updateBusinessHours(Long id, BusinessHoursDto businessHoursDto) {
        BusinessHours businessHours = businessHoursRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business hours not found"));
        
        businessHours.setDayOfWeek(businessHoursDto.getDayOfWeek());
        businessHours.setOpenTime(businessHoursDto.getOpenTime());
        businessHours.setCloseTime(businessHoursDto.getCloseTime());
        businessHours.setOpen(businessHoursDto.isOpen());
        
        BusinessHours updatedBusinessHours = businessHoursRepository.save(businessHours);
        return convertToDto(updatedBusinessHours);
    }

    @Override
    @Transactional
    public void deleteBusinessHours(Long id) {
        if (!businessHoursRepository.existsById(id)) {
            throw new EntityNotFoundException("Business hours not found");
        }
        businessHoursRepository.deleteById(id);
    }

    @Override
    @Transactional
    public BusinessHoursDto toggleBusinessHoursOpen(Long id, boolean isOpen) {
        BusinessHours businessHours = businessHoursRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business hours not found"));
        
        businessHours.setOpen(isOpen);
        
        BusinessHours updatedBusinessHours = businessHoursRepository.save(businessHours);
        return convertToDto(updatedBusinessHours);
    }
    
    private BusinessHoursDto convertToDto(BusinessHours businessHours) {
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