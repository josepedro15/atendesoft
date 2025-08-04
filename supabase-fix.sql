-- =====================================================
-- COMANDOS SQL PARA VERIFICAR E CORRIGIR SUPABASE
-- =====================================================

-- 1. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar se há dados na tabela user_roles
SELECT 'user_roles' as tabela, COUNT(*) as total FROM user_roles;

-- Verificar se há dados na tabela profiles
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles;

-- Verificar usuários com role 'user'
SELECT 'user_roles com role user' as info, COUNT(*) as total 
FROM user_roles 
WHERE role = 'user';

-- Verificar usuários com role 'admin'
SELECT 'user_roles com role admin' as info, COUNT(*) as total 
FROM user_roles 
WHERE role = 'admin';

-- Verificar dados na tabela user_implementation_progress
SELECT 'user_implementation_progress' as tabela, COUNT(*) as total FROM user_implementation_progress;

-- 2. VERIFICAR RELACIONAMENTOS
-- =====================================================

-- Verificar se todos os user_roles têm profiles correspondentes
SELECT 
    ur.user_id,
    ur.role,
    CASE WHEN p.user_id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_perfil
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
ORDER BY ur.role, ur.user_id;

-- Verificar se todos os profiles têm user_roles correspondentes
SELECT 
    p.user_id,
    p.full_name,
    CASE WHEN ur.user_id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
ORDER BY p.full_name;

-- 3. CORRIGIR PROBLEMAS COMUNS
-- =====================================================

-- 3.1. Criar user_roles para profiles que não têm
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'user' as role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.user_id IS NULL;

-- 3.2. Criar profiles para user_roles que não têm (se necessário)
INSERT INTO profiles (user_id, full_name, company)
SELECT ur.user_id, 'Nome não informado', 'Empresa não informada'
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE p.user_id IS NULL;

-- 4. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar políticas da tabela user_roles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Verificar políticas da tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar políticas da tabela user_implementation_progress
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_implementation_progress';

-- 5. CRIAR POLÍTICAS RLS SE NECESSÁRIO
-- =====================================================

-- Política para admins verem todos os user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" 
ON user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Política para admins verem todos os profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- REMOVER POLÍTICA CONFLITANTE E CRIAR NOVA PARA user_implementation_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON user_implementation_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON user_implementation_progress;
DROP POLICY IF EXISTS "Admins can manage progress" ON user_implementation_progress;

-- Política única para admins gerenciarem user_implementation_progress
CREATE POLICY "Admins can manage implementation progress" 
ON user_implementation_progress 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. VERIFICAR FUNÇÃO has_role
-- =====================================================

-- Verificar se a função has_role existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'has_role';

-- 7. DADOS DE TESTE (se necessário)
-- =====================================================

-- Inserir dados de teste se as tabelas estiverem vazias
-- (Descomente se necessário)

/*
-- Inserir roles de teste
INSERT INTO user_roles (user_id, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin'),
('00000000-0000-0000-0000-000000000002', 'user'),
('00000000-0000-0000-0000-000000000003', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- Inserir profiles de teste
INSERT INTO profiles (user_id, full_name, company) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin Teste', 'Empresa Admin'),
('00000000-0000-0000-0000-000000000002', 'Cliente Teste 1', 'Empresa Cliente 1'),
('00000000-0000-0000-0000-000000000003', 'Cliente Teste 2', 'Empresa Cliente 2')
ON CONFLICT (user_id) DO NOTHING;
*/

-- 8. VERIFICAÇÃO FINAL
-- =====================================================

-- Resumo final
SELECT 
    'RESUMO FINAL' as info,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'user') as clientes,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') as admins,
    (SELECT COUNT(*) FROM profiles) as perfis_total,
    (SELECT COUNT(*) FROM user_implementation_progress) as progressos_total;

-- Verificar se tudo está correto
SELECT 
    ur.user_id,
    ur.role,
    p.full_name,
    p.company
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
ORDER BY ur.role, p.full_name; 