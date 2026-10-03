-- Seed Master Admin user bypassing email constraints for dev & testing
DO $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
    admin_role_id INT;
BEGIN
    -- Ensure ROLE_ADMIN exists
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ROLE_ADMIN';

    -- Insert master admin user (password: admin)
    INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified)
    VALUES (
        admin_user_id,
        'admin',
        '$2a$12$5cwYprsoHkERL454fjtsNei6vkRo5iSOGRmKHMzr/aRHtWBxjxugu',
        'Master',
        'Admin',
        'ACTIVE',
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = '$2a$12$5cwYprsoHkERL454fjtsNei6vkRo5iSOGRmKHMzr/aRHtWBxjxugu',
        status = 'ACTIVE',
        email_verified = TRUE;

    -- Assign ROLE_ADMIN to master user
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (admin_user_id, admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$;
