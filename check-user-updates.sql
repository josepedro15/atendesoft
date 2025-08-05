-- Verificar Atualizações de Usuários
-- Execute este script no Supabase SQL Editor para verificar se os dados estão sendo atualizados

-- 1. Verificar dados atuais do usuário Lucas
SELECT 
    'Dados atuais do Lucas' as check_type,
    u.id,
    u.email,
    p.full_name,
    p.company,
    p.phone,
    ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'lcsgaspari@gmail.com';

-- 2. Verificar todos os usuários e seus dados
SELECT 
    'Todos os usuários' as check_type,
    u.id,
    u.email,
    p.full_name,
    p.company,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- 3. Verificar se há dados duplicados ou conflitantes
SELECT 
    'Verificação de duplicatas' as check_type,
    user_id,
    COUNT(*) as count
FROM profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

SELECT 
    'Verificação de roles duplicadas' as check_type,
    user_id,
    COUNT(*) as count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 4. Verificar logs de atualização recentes (se disponível)
-- Esta query pode não funcionar dependendo da configuração do Supabase
SELECT 
    'Logs de atividade' as check_type,
    event_time,
    event_type,
    table_name,
    record_id
FROM pg_stat_activity
WHERE query LIKE '%profiles%' OR query LIKE '%user_roles%'
ORDER BY event_time DESC
LIMIT 10;

-- 5. Testar atualização manual
-- Descomente as linhas abaixo para testar uma atualização manual
/*
UPDATE profiles 
SET 
    full_name = 'Lucas Teste',
    company = 'Empresa Teste',
    phone = '123456789'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lcsgaspari@gmail.com'
);

UPDATE user_roles 
SET role = 'user'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lcsgaspari@gmail.com'
);
*/ 