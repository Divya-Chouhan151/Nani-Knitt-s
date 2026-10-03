-- V6: Add optional_phone_number to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS optional_phone_number VARCHAR(32);
