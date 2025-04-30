-- Alter staff id column from SERIAL (INTEGER) to BIGSERIAL (BIGINT)
-- First, update the staff_services table that references staff(id)
ALTER TABLE staff_services DROP CONSTRAINT staff_services_staff_id_fkey;

-- Change id type in staff table
ALTER TABLE staff ALTER COLUMN id SET DATA TYPE BIGINT;

-- Change sequence to BIGINT
CREATE SEQUENCE IF NOT EXISTS staff_id_seq_bigint;
SELECT setval('staff_id_seq_bigint', (SELECT max(id) FROM staff));
ALTER TABLE staff ALTER COLUMN id SET DEFAULT nextval('staff_id_seq_bigint');

-- Re-create the foreign key constraint on staff_services
ALTER TABLE staff_services ADD CONSTRAINT staff_services_staff_id_fkey 
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE; 