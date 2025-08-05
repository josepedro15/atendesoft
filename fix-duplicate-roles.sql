-- Corrigir Roles Duplicadas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário com roles duplicadas
SELECT 
    'Usuário com roles duplicadas' as check_type,
    ur.user_id,
    ur.role,
    ur.created_at,
    u.email
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE ur.user_id = 'f52cc4f6-8ed0-4312-8c73-88e7b7213f4e'
ORDER BY ur.created_at;

-- 2. Manter apenas a role mais recente para cada usuário
-- Primeiro, vamos ver quais roles serão mantidas
WITH ranked_roles AS (
  SELECT 
    id,
    user_id,
    role,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM user_roles
)
SELECT 
    'Roles que serão mantidas' as check_type,
    user_id,
    role,
    created_at
FROM ranked_roles 
WHERE rn = 1
ORDER BY created_at DESC;

-- 3. Remover roles duplicadas (manter apenas a mais recente)
DELETE FROM user_roles 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_roles
  ) ranked
  WHERE rn > 1
);

-- 4. Verificar se a correção funcionou
SELECT 
    'Verificação após correção' as check_type,
    user_id,
    COUNT(*) as count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 5. Verificar dados finais do usuário problemático
SELECT 
    'Dados finais do usuário' as check_type,
    u.id,
    u.email,
    p.full_name,
    p.company,
    p.phone,
    ur.role,
    ur.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id = 'f52cc4f6-8ed0-4312-8c73-88e7b7213f4e'; 