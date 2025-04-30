package com.zentra.api.service.impl;

import com.zentra.api.dto.ServiceDto;
import com.zentra.api.dto.StaffDto;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.Service;
import com.zentra.api.model.Staff;
import com.zentra.api.repository.BusinessProfileRepository;
import com.zentra.api.repository.ServiceRepository;
import com.zentra.api.repository.StaffRepository;
import com.zentra.api.service.StaffService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final ServiceRepository serviceRepository;

    @Autowired
    public StaffServiceImpl(
            StaffRepository staffRepository,
            BusinessProfileRepository businessProfileRepository,
            ServiceRepository serviceRepository) {
        this.staffRepository = staffRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    @Transactional
    public StaffDto createStaff(StaffDto staffDto) {
        BusinessProfile businessProfile = businessProfileRepository.findById(staffDto.getBusinessId())
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        Staff staff = new Staff();
        staff.setBusiness(businessProfile);
        staff.setFirstName(staffDto.getFirstName());
        staff.setLastName(staffDto.getLastName());
        staff.setEmail(staffDto.getEmail());
        staff.setPhoneNumber(staffDto.getPhoneNumber());
        staff.setPosition(staffDto.getPosition());
        staff.setBio(staffDto.getBio());
        staff.setPhotoUrl(staffDto.getPhotoUrl());
        staff.setActive(staffDto.isActive());
        
        // Add services if provided
        if (staffDto.getServices() != null && !staffDto.getServices().isEmpty()) {
            List<Service> services = new ArrayList<>();
            for (ServiceDto serviceDto : staffDto.getServices()) {
                Service service = serviceRepository.findById(serviceDto.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Service not found: " + serviceDto.getId()));
                services.add(service);
            }
            staff.setServices(services);
        }
        
        Staff savedStaff = staffRepository.save(staff);
        return convertToDto(savedStaff);
    }

    @Override
    public StaffDto getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        return convertToDto(staff);
    }

    @Override
    public List<StaffDto> getStaffByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        List<Staff> staffMembers = staffRepository.findByBusiness(businessProfile);
        return staffMembers.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<StaffDto> getActiveStaffByBusinessId(Long businessId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        List<Staff> staffMembers = staffRepository.findByBusinessAndActiveTrue(businessProfile);
        return staffMembers.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<StaffDto> getStaffByServiceId(Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        List<Staff> staffMembers = staffRepository.findByServicesContaining(service);
        return staffMembers.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<StaffDto> getStaffByBusinessIdAndServiceId(Long businessId, Long serviceId) {
        BusinessProfile businessProfile = businessProfileRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        List<Staff> staffMembers = staffRepository.findByBusinessAndServicesContaining(businessProfile, service);
        return staffMembers.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffDto updateStaff(Long id, StaffDto staffDto) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        
        staff.setFirstName(staffDto.getFirstName());
        staff.setLastName(staffDto.getLastName());
        staff.setEmail(staffDto.getEmail());
        staff.setPhoneNumber(staffDto.getPhoneNumber());
        staff.setPosition(staffDto.getPosition());
        staff.setBio(staffDto.getBio());
        staff.setPhotoUrl(staffDto.getPhotoUrl());
        staff.setActive(staffDto.isActive());
        staff.setUpdatedAt(LocalDateTime.now());
        
        Staff updatedStaff = staffRepository.save(staff);
        return convertToDto(updatedStaff);
    }

    @Override
    @Transactional
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new EntityNotFoundException("Staff member not found");
        }
        staffRepository.deleteById(id);
    }

    @Override
    @Transactional
    public StaffDto toggleStaffActive(Long id, boolean active) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        
        staff.setActive(active);
        staff.setUpdatedAt(LocalDateTime.now());
        
        Staff updatedStaff = staffRepository.save(staff);
        return convertToDto(updatedStaff);
    }

    @Override
    @Transactional
    public StaffDto addServiceToStaff(Long staffId, Long serviceId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        if (!staff.getServices().contains(service)) {
            staff.getServices().add(service);
            staff.setUpdatedAt(LocalDateTime.now());
            Staff updatedStaff = staffRepository.save(staff);
            return convertToDto(updatedStaff);
        }
        
        return convertToDto(staff);
    }

    @Override
    @Transactional
    public StaffDto removeServiceFromStaff(Long staffId, Long serviceId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        
        if (staff.getServices().contains(service)) {
            staff.getServices().remove(service);
            staff.setUpdatedAt(LocalDateTime.now());
            Staff updatedStaff = staffRepository.save(staff);
            return convertToDto(updatedStaff);
        }
        
        return convertToDto(staff);
    }
    
    private StaffDto convertToDto(Staff staff) {
        StaffDto dto = new StaffDto();
        dto.setId(staff.getId());
        dto.setBusinessId(staff.getBusiness().getId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setEmail(staff.getEmail());
        dto.setPhoneNumber(staff.getPhoneNumber());
        dto.setPosition(staff.getPosition());
        dto.setBio(staff.getBio());
        dto.setPhotoUrl(staff.getPhotoUrl());
        dto.setActive(staff.isActive());
        
        // Convert services to DTOs
        if (staff.getServices() != null && !staff.getServices().isEmpty()) {
            List<ServiceDto> serviceDtos = staff.getServices().stream()
                    .map(this::convertServiceToDto)
                    .collect(Collectors.toList());
            dto.setServices(serviceDtos);
        } else {
            dto.setServices(new ArrayList<>());
        }
        
        return dto;
    }
    
    private ServiceDto convertServiceToDto(Service service) {
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