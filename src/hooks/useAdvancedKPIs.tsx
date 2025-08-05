import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedKPIs } from '@/integrations/supabase/types';

export const useAdvancedKPIs = () => {
  const [advancedKPIs, setAdvancedKPIs] = useState<AdvancedKPIs>({
    mrr: { current: 0, previous: 0, growth: 0, sparkline: [] },
    arr: { current: 0, previous: 0, growth: 0, sparkline: [] },
    churn: { rate: 0, retention: 0, hasData: false },
    ltvCac: { ltv: 0, cac: 0, ratio: 0, hasData: false },
    despesas: { fixas: 0, variaveis: 0, total: 0, hasData: false },
    previsaoCaixa: { receitas: 0, despesas: 0, saldo: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentMonthRef = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getPreviousMonthRef = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  };

  const calculateMRR = (payments: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calcular receita dos últimos 3 meses para sparkline
    const sparkline = [];
    for (let i = 2; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthPayments = payments.filter(payment => {
        const paymentDate = payment.paid_date ? new Date(payment.paid_date) : new Date(payment.created_at);
        return paymentDate.getMonth() === month.getMonth() && 
               paymentDate.getFullYear() === month.getFullYear() &&
               payment.status === 'paid';
      });
      const revenue = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      sparkline.push(revenue);
    }

    const current = sparkline[2] || 0;
    const previous = sparkline[1] || 0;
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, previous, growth, sparkline };
  };

  const fetchAdvancedKPIs = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentMonthRef = getCurrentMonthRef();
      const previousMonthRef = getPreviousMonthRef();

      // 1. Calcular MRR e ARR baseado nos pagamentos existentes
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, status, paid_date, created_at');

      // MRR (Monthly Recurring Revenue) - média dos últimos 3 meses
      const mrrData = calculateMRR(paymentsData || []);
      
      // ARR (Annual Recurring Revenue) - MRR * 12
      const arrData = {
        current: mrrData.current * 12,
        previous: mrrData.previous * 12,
        growth: mrrData.growth,
        sparkline: mrrData.sparkline.map(val => val * 12)
      };

      // 2. Buscar dados de Churn & Retenção
      const { data: churnData } = await supabase
        .from('kpi_manual_inputs')
        .select('*')
        .eq('mes_ref', currentMonthRef)
        .single();

      const churnInfo = churnData ? {
        rate: churnData.cancelados / churnData.clientes_inicio * 100,
        retention: churnData.renovados / churnData.clientes_inicio * 100,
        hasData: true
      } : {
        rate: 0,
        retention: 0,
        hasData: false
      };

      // 3. Buscar dados de LTV/CAC
      const ltvCacInfo = churnData && churnData.ltv && churnData.cac ? {
        ltv: churnData.ltv,
        cac: churnData.cac,
        ratio: churnData.ltv / churnData.cac,
        hasData: true
      } : {
        ltv: 0,
        cac: 0,
        ratio: 0,
        hasData: false
      };

      // 4. Buscar despesas
      const { data: despesasData } = await supabase
        .from('despesas_mes')
        .select('*')
        .eq('mes_ref', currentMonthRef)
        .single();

      const despesasInfo = despesasData ? {
        fixas: despesasData.fixas,
        variaveis: despesasData.variaveis,
        total: despesasData.fixas + despesasData.variaveis,
        hasData: true
      } : {
        fixas: 0,
        variaveis: 0,
        total: 0,
        hasData: false
      };

      // 5. Calcular previsão de caixa
      const previsaoCaixa = {
        receitas: mrrData.current,
        despesas: despesasInfo.total,
        saldo: mrrData.current - despesasInfo.total
      };

      setAdvancedKPIs({
        mrr: mrrData,
        arr: arrData,
        churn: churnInfo,
        ltvCac: ltvCacInfo,
        despesas: despesasInfo,
        previsaoCaixa
      });

    } catch (err) {
      console.error('Erro ao buscar KPIs avançados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const saveChurnData = async (data: { clientesInicio: number; cancelados: number; renovados: number }) => {
    try {
      const currentMonthRef = getCurrentMonthRef();
      
      const { error } = await supabase
        .from('kpi_manual_inputs')
        .upsert({
          mes_ref: currentMonthRef,
          clientes_inicio: data.clientesInicio,
          cancelados: data.cancelados,
          renovados: data.renovados
        });

      if (error) throw error;
      
      // Refetch data
      await fetchAdvancedKPIs();
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar dados de churn:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  const saveLTVCACData = async (data: { ltv: number; cac: number }) => {
    try {
      const currentMonthRef = getCurrentMonthRef();
      
      const { error } = await supabase
        .from('kpi_manual_inputs')
        .upsert({
          mes_ref: currentMonthRef,
          ltv: data.ltv,
          cac: data.cac
        });

      if (error) throw error;
      
      // Refetch data
      await fetchAdvancedKPIs();
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar dados de LTV/CAC:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  const saveDespesasData = async (data: { fixas: number; variaveis: number }) => {
    try {
      const currentMonthRef = getCurrentMonthRef();
      
      const { error } = await supabase
        .from('despesas_mes')
        .upsert({
          mes_ref: currentMonthRef,
          fixas: data.fixas,
          variaveis: data.variaveis
        });

      if (error) throw error;
      
      // Refetch data
      await fetchAdvancedKPIs();
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar dados de despesas:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Fetch inicial apenas
  useEffect(() => {
    fetchAdvancedKPIs();
  }, []);

  return {
    advancedKPIs,
    loading,
    error,
    saveChurnData,
    saveLTVCACData,
    saveDespesasData,
    refetch: fetchAdvancedKPIs
  };
}; 