package com.zentra.api.dto;

import com.zentra.api.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long businessId;
    private String businessName;
    private String businessAddress;
    private String businessPhone;
    private Long serviceId;
    private String serviceName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private int durationMinutes;
    private BigDecimal price;
    private AppointmentStatus status;
    private String notes;
    private String cancellationReason;
} 