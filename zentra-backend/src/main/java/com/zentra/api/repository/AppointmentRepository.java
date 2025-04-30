package com.zentra.api.repository;

import com.zentra.api.model.Appointment;
import com.zentra.api.model.AppointmentStatus;
import com.zentra.api.model.BusinessProfile;
import com.zentra.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments by customer
    List<Appointment> findByCustomer(User customer);
    
    // Find appointments by business
    List<Appointment> findByBusiness(BusinessProfile business);
    
    // Find appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);
    
    // Find appointments by customer and status
    List<Appointment> findByCustomerAndStatus(User customer, AppointmentStatus status);
    
    // Find appointments by business and status
    List<Appointment> findByBusinessAndStatus(BusinessProfile business, AppointmentStatus status);
    
    // Find appointments by date
    List<Appointment> findByDate(LocalDate date);
    
    // Find appointments by business and date
    List<Appointment> findByBusinessAndDate(BusinessProfile business, LocalDate date);
    
    // Find appointments by customer and date
    List<Appointment> findByCustomerAndDate(User customer, LocalDate date);
    
    // Find appointments by business and date range
    List<Appointment> findByBusinessAndDateBetween(BusinessProfile business, LocalDate startDate, LocalDate endDate);
    
    // Find upcoming appointments for a customer
    List<Appointment> findByCustomerAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(User customer, LocalDate date);
    
    // Find upcoming appointments for a business
    List<Appointment> findByBusinessAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(BusinessProfile business, LocalDate date);
    
    // Find past appointments for a customer
    List<Appointment> findByCustomerAndDateLessThanOrderByDateDescStartTimeDesc(User customer, LocalDate date);
    
    // Find past appointments for a business
    List<Appointment> findByBusinessAndDateLessThanOrderByDateDescStartTimeDesc(BusinessProfile business, LocalDate date);
} 