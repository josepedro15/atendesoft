import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPayments: number;
  pendingPayments: number;
  totalAmount: number;
  pendingAmount: number;
  totalServices: number;
  activeServices: number;
  totalImplementations: number;
  activeImplementations: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    totalServices: 0,
    activeServices: 0,
    totalImplementations: 0,
    activeImplementations: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar estatísticas de usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, created_at');

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      const totalUsers = usersData?.length || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const activeUsers = usersData?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length || 0;

      // 2. Buscar estatísticas de pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, created_at, paid_date');

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }

      const totalPayments = paymentsData?.length || 0;
      const pendingPayments = paymentsData?.filter(p => p.status === 'pending').length || 0;
      
      const totalAmount = paymentsData?.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0) || 0;
      const pendingAmount = paymentsData
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0) || 0;

      // 3. Buscar estatísticas de implementações para calcular serviços ativos
      const { data: implementationsData, error: implementationsError } = await supabase
        .from('user_implementation_progress')
        .select('user_id, status, created_at');

      if (implementationsError) {
        console.error('Erro ao buscar implementações:', implementationsError);
        // Não vamos falhar se a tabela não existir
      }

      // Calcular serviços ativos baseado em implementações 100% completas
      let totalServices = 0;
      let activeServices = 0;

      if (implementationsData && implementationsData.length > 0) {
        // Agrupar por usuário para calcular progresso
        const userProgressMap = new Map<string, any[]>();
        
        implementationsData.forEach(impl => {
          if (!userProgressMap.has(impl.user_id)) {
            userProgressMap.set(impl.user_id, []);
          }
          userProgressMap.get(impl.user_id)!.push(impl);
        });

        // Calcular quantos usuários têm 100% de progresso
        totalServices = userProgressMap.size;
        
        // Assumindo que temos 5 etapas padrão (como definido no AdminImplementation)
        const totalSteps = 5;
        
        activeServices = Array.from(userProgressMap.values()).filter(userSteps => {
          const completedSteps = userSteps.filter(step => step.status === 'completed').length;
          return completedSteps === totalSteps; // 100% completo
        }).length;
      }

      // 4. Calcular estatísticas de implementações (usando dados já buscados)
      const totalImplementations = implementationsData?.length || 0;
      const activeImplementations = implementationsData?.filter(i => i.status === 'in_progress').length || 0;

      // 5. Calcular receita mensal
      const currentMonthPayments = paymentsData?.filter(p => {
        const paymentDate = p.paid_date ? new Date(p.paid_date) : new Date(p.created_at);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               p.status === 'paid';
      }) || [];

      const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

      // 6. Calcular crescimento mensal (simplificado)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const lastMonthPayments = paymentsData?.filter(p => {
        const paymentDate = p.paid_date ? new Date(p.paid_date) : new Date(p.created_at);
        return paymentDate.getMonth() === lastMonth && 
               paymentDate.getFullYear() === lastMonthYear &&
               p.status === 'paid';
      }) || [];

      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalPayments,
        pendingPayments,
        totalAmount,
        pendingAmount,
        totalServices,
        activeServices,
        totalImplementations,
        activeImplementations,
        monthlyRevenue,
        monthlyGrowth
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
}; 