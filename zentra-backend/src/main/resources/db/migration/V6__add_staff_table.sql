-- Create staff table
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    position VARCHAR(255),
    bio TEXT,
    photo_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- Create join table for staff services
CREATE TABLE staff_services (
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- Add index for better performance
CREATE INDEX idx_staff_business_id ON staff(business_id);
CREATE INDEX idx_staff_active ON staff(active);
CREATE INDEX idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service_id ON staff_services(service_id); 