// Based on zentra-backend/src/main/java/com/zentra/api/dto/BusinessProfileDto.java

// TODO: Define this interface based on your backend ServiceDto
interface ServiceDto { 
    id: number;
    // Add other fields like name, description, price, durationMinutes, imageUrl, active, etc.
}

// TODO: Define this interface based on your backend BusinessHoursDto
interface BusinessHoursDto {
    id: number;
    dayOfWeek: string; // Or use an enum type matching Java's DayOfWeek
    openTime: string; // Consider using string in HH:mm format or a Date object
    closeTime: string;
    isOpen: boolean;
    // Add other fields if necessary
}

export interface BusinessProfileDto {
    id: number | null; // Can be null when creating
    ownerId: number; // Assuming ownerId is number
    ownerName?: string; // Optional based on backend DTO
    ownerEmail?: string; // Optional based on backend DTO
    businessName: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    website: string;
    logoUrl: string;
    services: ServiceDto[];
    businessHours: BusinessHoursDto[];
    active: boolean;
} 