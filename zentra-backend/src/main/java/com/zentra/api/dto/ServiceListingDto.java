package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceListingDto {
    private Long id;
    private String name;
    private int duration;
    private double price;
} 