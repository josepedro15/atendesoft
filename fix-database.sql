-- Fix Database Issues - Run this in Supabase SQL Editor
-- This script fixes the missing has_role function and app_role type

-- 1. Create app_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Drop existing has_role function if it exists
DROP FUNCTION IF EXISTS has_role(UUID, app_role);
DROP FUNCTION IF EXISTS has_role(uuid, app_role);
DROP FUNCTION IF EXISTS has_role(UUID, text);
DROP FUNCTION IF EXISTS has_role(uuid, text);

-- 3. Create has_role function
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

-- 4. Grant execute permission on has_role function
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO anon;

-- 5. Drop existing problematic policies
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

-- 6. Recreate policies with proper has_role function
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

-- 7. Insert your user data (replace with your actual user ID)
INSERT INTO user_roles (user_id, role) VALUES
('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'admin')  -- Your user ID from the logs
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profiles (user_id, full_name, company) VALUES
('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'José Pedro', 'AtendeSSoft')
ON CONFLICT (user_id) DO NOTHING;

-- 8. Verify the fix
SELECT 
    'User Roles' as table_name,
    COUNT(*) as count
FROM user_roles
UNION ALL
SELECT 
    'Profiles' as table_name,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Has Role Function' as table_name,
    CASE WHEN has_role('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'admin'::app_role) 
         THEN 1 ELSE 0 END as count; 