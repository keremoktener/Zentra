CREATE TABLE business_profiles (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    phone_number VARCHAR(20),
    website VARCHAR(255),
    logo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_business_profile_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_service_business FOREIGN KEY (business_id) REFERENCES business_profiles(id)
);

CREATE TABLE business_hours (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_business_hours_business FOREIGN KEY (business_id) REFERENCES business_profiles(id)
);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    business_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    CONSTRAINT fk_appointment_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_appointment_business FOREIGN KEY (business_id) REFERENCES business_profiles(id),
    CONSTRAINT fk_appointment_service FOREIGN KEY (service_id) REFERENCES services(id)
); 