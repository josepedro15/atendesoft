-- Debug Edge Function e Configurações
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas têm as constraints corretas
SELECT 
    'Constraints das tabelas' as check_type,
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('profiles', 'user_roles')
ORDER BY table_name, constraint_type;

-- 2. Verificar se RLS está ativo e políticas funcionando
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles');

-- 3. Verificar políticas RLS
SELECT 
    'Políticas RLS' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 4. Testar função has_role diretamente
SELECT 
    'Teste has_role' as check_type,
    has_role('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'admin'::app_role) as is_admin,
    has_role('7f784f8d-ce6b-4c8c-bd3e-3421d259c44a', 'user'::app_role) as is_user;

-- 5. Verificar se o usuário admin pode fazer operações
-- Simular uma operação de update
SELECT 
    'Teste de permissão' as check_type,
    auth.uid() as current_user_id,
    has_role(auth.uid(), 'admin'::app_role) as can_admin;

-- 6. Verificar estrutura das tabelas
SELECT 
    'Estrutura profiles' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 
    'Estrutura user_roles' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 7. Verificar se há triggers que possam estar interferindo
SELECT 
    'Triggers' as check_type,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('profiles', 'user_roles')
ORDER BY event_object_table, trigger_name; 