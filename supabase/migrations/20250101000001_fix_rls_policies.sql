-- Fix RLS Policies and Functions
-- This migration fixes the missing has_role function and app_role type

-- Create app_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_roles.user_id = has_role.user_id 
        AND user_roles.role = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on has_role function
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO anon;

-- Drop existing policies that use has_role function
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all progress" ON user_implementation_progress;
DROP POLICY IF EXISTS "Admins can manage progress" ON user_implementation_progress;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all contracts" ON contract_files;
DROP POLICY IF EXISTS "Admins can manage contracts" ON contract_files;
DROP POLICY IF EXISTS "Admins can manage implementation steps" ON implementation_steps;

-- Recreate policies with proper has_role function
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all profiles" 
ON profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all roles" 
ON user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all roles" 
ON user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all progress" 
ON user_implementation_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage progress" 
ON user_implementation_progress 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all payments" 
ON payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payments" 
ON payments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all contracts" 
ON contract_files 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage contracts" 
ON contract_files 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage implementation steps" 
ON implementation_steps 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert test data if tables are empty
INSERT INTO user_roles (user_id, role) VALUES
('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'admin')  -- Your user ID
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (user_id, full_name, company) VALUES
('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'José Pedro', 'AtendeSSoft')
ON CONFLICT (user_id) DO NOTHING; 