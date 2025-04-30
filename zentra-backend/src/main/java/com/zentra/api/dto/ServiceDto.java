package com.zentra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {
    private Long id;
    private Long businessId;
    private String name;
    private String description;
    private int durationMinutes;
    private BigDecimal price;
    private String imageUrl;
    private boolean active;
} 