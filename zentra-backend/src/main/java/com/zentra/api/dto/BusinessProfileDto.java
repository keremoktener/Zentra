package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String businessName;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phoneNumber;
    private String website;
    private String logoUrl;
    private List<ServiceDto> services;
    private List<BusinessHoursDto> businessHours;
    private boolean active;
} 