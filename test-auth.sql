-- Test Authentication Setup
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if tables exist and have data
SELECT 'user_roles table' as check_type, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 'profiles table' as check_type, COUNT(*) as count FROM profiles;

-- 2. Check specific user data
SELECT 
    'User Data' as check_type,
    ur.user_id,
    ur.role,
    p.full_name,
    p.company
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.user_id = '7f784f8d-ce6b-4c8c-bd3e-3421d259c44a';

-- 3. Test has_role function
SELECT 
    'has_role function test' as check_type,
    has_role('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'admin'::app_role) as is_admin,
    has_role('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'user'::app_role) as is_user;

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'payments', 'user_implementation_progress')
ORDER BY tablename, policyname;

-- 5. Test direct queries (simulate what the app does)
-- This should work for an authenticated user
SELECT 'Direct profile query test' as test_name, COUNT(*) as count 
FROM profiles 
WHERE user_id = '7f784f8d-ce6b-4c8c-bd3e-3421d259c44a';

SELECT 'Direct role query test' as test_name, COUNT(*) as count 
FROM user_roles 
WHERE user_id = '7f784f8d-ce6b-4c8c-bd3e-3421d259c44a'; 