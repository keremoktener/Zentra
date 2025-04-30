package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessListingDto {
    private Long id;
    private String name;
    private String category;
    private Double rating;
    private String image;
    private List<ServiceListingDto> services;
} 