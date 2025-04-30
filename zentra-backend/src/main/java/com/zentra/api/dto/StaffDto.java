package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDto {
    private Long id;
    private Long businessId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String position;
    private String bio;
    private String photoUrl;
    private List<ServiceDto> services;
    private boolean active;
} 