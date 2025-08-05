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
    console.log('🚀 useDashboard: Iniciando busca de estatísticas...');
    console.log('🔍 Debug: Hook useDashboard executado!');
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar estatísticas de usuários
      console.log('📊 Buscando estatísticas de usuários...');
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, created_at');

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }
      
      console.log('✅ Usuários encontrados:', usersData?.length || 0);

      const totalUsers = usersData?.length || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const activeUsers = usersData?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length || 0;

      // 2. Buscar estatísticas de pagamentos
      console.log('💰 Buscando estatísticas de pagamentos...');
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, created_at, paid_date');

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }
      
      console.log('✅ Pagamentos encontrados:', paymentsData?.length || 0);

      const totalPayments = paymentsData?.length || 0;
      const pendingPayments = paymentsData?.filter(payment => payment.status === 'pending').length || 0;
      
      const totalAmount = paymentsData?.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0) || 0;
      const pendingAmount = paymentsData
        ?.filter(payment => payment.status === 'pending')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0) || 0;

      // 3. Buscar estatísticas de implementações para calcular serviços ativos
      console.log('🔧 Buscando estatísticas de implementações...');
      const { data: implementationsData, error: implementationsError } = await supabase
        .from('user_implementation_progress')
        .select('user_id, status, created_at');

      if (implementationsError) {
        console.error('Erro ao buscar implementações:', implementationsError);
        // Não vamos falhar se a tabela não existir
      }

      // Calcular serviços ativos e projetos em implementação baseado em implementações
      let totalServices = 0;
      let activeServices = 0;
      let totalImplementations = 0;
      let activeImplementations = 0;

      console.log('🔍 Debug - Dados brutos de implementações:', implementationsData);

      if (implementationsData && implementationsData.length > 0) {
        // Agrupar por usuário para calcular progresso
        const userProgressMap = new Map<string, any[]>();
        
        implementationsData.forEach(impl => {
          console.log('📝 Processando implementação:', impl);
          if (!userProgressMap.has(impl.user_id)) {
            userProgressMap.set(impl.user_id, []);
          }
          userProgressMap.get(impl.user_id)!.push(impl);
        });
        
        console.log('📊 Mapa de progresso por usuário:', userProgressMap);

        // Usar o número real de steps de cada usuário
        console.log('🔍 Debug - Calculando implementações e serviços:');
        console.log('Total de usuários com implementação:', userProgressMap.size);
        
        console.log('🔍 Debug - Iniciando processamento de usuários...');
        console.log('🔍 Debug - userProgressMap entries:', Array.from(userProgressMap.entries()));
        
        Array.from(userProgressMap.entries()).forEach(([userId, userSteps]) => {
          console.log(`🔍 Debug - Processando usuário ${userId}:`, userSteps);
          
          // Usar o número real de steps deste usuário
          const totalSteps = userSteps.length;
          const completedSteps = userSteps.filter(step => step.status === 'completed' || step.status === 'complet').length;
          const progressPercentage = (completedSteps / totalSteps) * 100;
          
          // Calcular percentual arredondado para evitar problemas de precisão decimal
          const progressRounded = Math.round(progressPercentage);
          
          console.log(`👤 Usuário ${userId}:`, {
            totalSteps,
            completedSteps,
            progressPercentage: `${progressPercentage}%`,
            progressRounded: `${progressRounded}%`,
            status: progressRounded === 100 ? 'SERVIÇO ATIVO' : 'EM IMPLEMENTAÇÃO'
          });
          
          if (progressRounded === 100) {
            // Exatamente 100% completo = Serviço Ativo
            activeServices++;
            console.log(`✅ Usuário ${userId} -> Serviço Ativo (${progressRounded}%)`);
          } else {
            // < 100% = Projeto em Implementação
            activeImplementations++;
            console.log(`🔄 Usuário ${userId} -> Em Implementação (${progressRounded}%)`);
          }
        });
        
        console.log('📊 Resultado final:', {
          totalServices,
          activeServices,
          totalImplementations,
          activeImplementations
        });
        
        // Verificação adicional
        console.log('🔍 Verificação final:');
        console.log('- Total de usuários únicos:', userProgressMap.size);
        console.log('- Serviços ativos (100%):', activeServices);
        console.log('- Em implementação (<100%):', activeImplementations);
        console.log('- Soma deve ser igual ao total:', activeServices + activeImplementations === userProgressMap.size);
        
        // Total de serviços = todos os clientes com implementação
        totalServices = userProgressMap.size;
        // Total de implementações = todos os clientes com implementação
        totalImplementations = userProgressMap.size;
        
        console.log('🔧 Após atribuição de totais:');
        console.log('- totalServices:', totalServices);
        console.log('- activeServices:', activeServices);
        console.log('- totalImplementations:', totalImplementations);
        console.log('- activeImplementations:', activeImplementations);
      }

      // 5. Calcular receita mensal
      console.log('💰 Debug - Calculando receita mensal...');
      console.log('💰 Debug - Mês atual:', currentMonth, 'Ano atual:', currentYear);
      
      const currentMonthPayments = paymentsData?.filter(payment => {
        // Corrigir interpretação de data para evitar problemas de fuso horário (VERSÃO CORRIGIDA)
        let paymentDate;
        if (payment.paid_date) {
          const dateParts = payment.paid_date.split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // month - 1 porque getMonth() retorna 0-11
          const day = parseInt(dateParts[2]);
          paymentDate = new Date(year, month, day);
        } else {
          paymentDate = new Date(payment.created_at);
        }
        
        const isCurrentMonth = paymentDate.getMonth() === currentMonth && 
                              paymentDate.getFullYear() === currentYear &&
                              payment.status === 'paid';
        
        if (isCurrentMonth) {
          console.log('💰 Debug - Pagamento do mês atual:', {
            amount: payment.amount,
            status: payment.status,
            paid_date: payment.paid_date,
            created_at: payment.created_at,
            paymentDate: paymentDate
          });
        }
        
        return isCurrentMonth;
      }) || [];

      const monthlyRevenue = currentMonthPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);
      console.log('💰 Debug - Receita do mês atual:', monthlyRevenue);

      // 6. Calcular crescimento mensal (simplificado)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      console.log('💰 Debug - Mês anterior:', lastMonth, 'Ano anterior:', lastMonthYear);
      
      // Debug: Verificar todos os pagamentos para entender a distribuição
      console.log('💰 Debug - Todos os pagamentos disponíveis:');
      paymentsData?.forEach(payment => {
        // Corrigir interpretação de data para evitar problemas de fuso horário (VERSÃO CORRIGIDA)
        let paymentDate;
        if (payment.paid_date) {
          // Para paid_date, usar apenas a data (YYYY-MM-DD) sem fuso horário
          const dateParts = payment.paid_date.split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // month - 1 porque getMonth() retorna 0-11
          const day = parseInt(dateParts[2]);
          paymentDate = new Date(year, month, day);
        } else {
          paymentDate = new Date(payment.created_at);
        }
        
        console.log('💰 Debug - Pagamento:', {
          amount: payment.amount,
          status: payment.status,
          paid_date: payment.paid_date,
          created_at: payment.created_at,
          paymentDate: paymentDate,
          month: paymentDate.getMonth(),
          year: paymentDate.getFullYear()
        });
      });
      
      const lastMonthPayments = paymentsData?.filter(payment => {
        // Corrigir interpretação de data para evitar problemas de fuso horário (VERSÃO CORRIGIDA)
        let paymentDate;
        if (payment.paid_date) {
          const dateParts = payment.paid_date.split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // month - 1 porque getMonth() retorna 0-11
          const day = parseInt(dateParts[2]);
          paymentDate = new Date(year, month, day);
        } else {
          paymentDate = new Date(payment.created_at);
        }
        
        const isLastMonth = paymentDate.getMonth() === lastMonth && 
                           paymentDate.getFullYear() === lastMonthYear &&
                           payment.status === 'paid';
        
        if (isLastMonth) {
          console.log('💰 Debug - Pagamento do mês anterior:', {
            amount: payment.amount,
            status: payment.status,
            paid_date: payment.paid_date,
            created_at: payment.created_at,
            paymentDate: paymentDate
          });
        }
        
        return isLastMonth;
      }) || [];

      const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);
      console.log('💰 Debug - Receita do mês anterior:', lastMonthRevenue);
      
      const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      console.log('💰 Debug - Crescimento mensal:', monthlyGrowth + '%');

      const finalStats = {
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
      };

      console.log('📊 useDashboard: Estatísticas finais calculadas:', finalStats);
      setStats(finalStats);

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