-- Verificar se a tabela user_implementation_progress existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_implementation_progress'
) as table_exists;

-- Verificar estrutura da tabela se existir
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_implementation_progress'
ORDER BY ordinal_position;

-- Verificar dados na tabela
SELECT 
  user_id,
  status,
  created_at,
  COUNT(*) as total_records
FROM user_implementation_progress 
GROUP BY user_id, status, created_at
ORDER BY user_id, created_at;

-- Verificar total de registros por usuário
SELECT 
  user_id,
  COUNT(*) as total_steps,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_steps,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_steps,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_steps
FROM user_implementation_progress 
GROUP BY user_id
ORDER BY user_id;

-- Verificar percentual de conclusão por usuário
WITH user_progress AS (
  SELECT 
    user_id,
    COUNT(*) as total_steps,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_steps
  FROM user_implementation_progress 
  GROUP BY user_id
)
SELECT 
  user_id,
  total_steps,
  completed_steps,
  ROUND((completed_steps::float / total_steps) * 100) as progress_percentage,
  CASE 
    WHEN ROUND((completed_steps::float / total_steps) * 100) = 100 THEN 'SERVIÇO ATIVO'
    ELSE 'EM IMPLEMENTAÇÃO'
  END as status
FROM user_progress
ORDER BY user_id; 