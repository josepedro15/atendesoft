import { useState, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  GitBranch, 
  CreditCard, 
  DollarSign, 
  Layers, 
  MessageSquare,
  UserPlus,
  FileText,
  Settings,
  BarChart3
} from "lucide-react";

import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
// Temporariamente comentado para debug
// import {
//   MRRCard,
//   ARRCard,
//   ChurnRetentionCard,
//   LTVCACCard,
//   DespesasFixasCard,
//   DespesasVariaveisCard,
//   PrevisaoCaixaCard
// } from "./AdvancedKPICards";

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para gerar estatísticas baseadas nos dados reais
const generateStats = (stats: any) => [
  {
    id: '1',
    title: 'Clientes Ativos',
    value: stats.totalUsers,
    description: `+${stats.activeUsers} este mês`,
    icon: <Users className="h-4 w-4" />,
    trend: { value: stats.activeUsers, isPositive: stats.activeUsers > 0 },
    link: '/dashboard/users',
    linkText: 'Ver todos os clientes'
  },
  {
    id: '2',
    title: 'Projetos em Implementação',
    value: stats.activeImplementations,
    description: `${stats.activeImplementations} em progresso`,
    icon: <GitBranch className="h-4 w-4" />,
    link: '/dashboard/admin-implementation',
    linkText: 'Gerenciar implementações'
  },
  {
    id: '3',
    title: 'Pagamentos Pendentes',
    value: formatCurrency(stats.pendingAmount),
    description: `${stats.pendingPayments} faturas`,
    icon: <CreditCard className="h-4 w-4" />,
    variant: 'warning' as const,
    link: '/dashboard/admin-payments',
    linkText: 'Ver pagamentos'
  },
  {
    id: '4',
    title: 'Recebido no Mês',
    value: formatCurrency(stats.monthlyRevenue),
    description: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}% vs mês anterior`,
    icon: <DollarSign className="h-4 w-4" />,
    trend: { value: Math.abs(stats.monthlyGrowth), isPositive: stats.monthlyGrowth >= 0 },
    variant: 'success' as const
  },
  {
    id: '5',
    title: 'Serviços Ativos',
    value: stats.activeServices,
    description: `${stats.activeServices} ativos`,
    icon: <Layers className="h-4 w-4" />,
    link: '/dashboard/admin-services',
    linkText: 'Ver serviços'
  },
  {
    id: '6',
    title: 'Total de Pagamentos',
    value: stats.totalPayments,
    description: `${stats.pendingPayments} pendentes`,
    icon: <MessageSquare className="h-4 w-4" />,
    variant: 'default' as const,
    link: '/dashboard/admin-payments',
    linkText: 'Ver pagamentos'
  }
];

const mockQuickActions = [
  {
    id: '1',
    title: 'Adicionar Cliente',
    description: 'Cadastrar novo usuário',
    icon: <UserPlus className="h-4 w-4" />,
    route: '/dashboard/users',
    color: 'primary' as const
  },
  {
    id: '2',
    title: 'Novo Contrato',
    description: 'Criar contrato',
    icon: <FileText className="h-4 w-4" />,
    route: '/dashboard/admin-contracts',
    color: 'success' as const
  },
  {
    id: '3',
    title: 'Configurações',
    description: 'Ajustes do sistema',
    icon: <Settings className="h-4 w-4" />,
    route: '/dashboard/settings',
    color: 'warning' as const
  }
];

const AdminDashboard = () => {
  // Temporariamente desabilitado useAuth para debug
  // const { isAdmin, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  // Debug: Renderizar diretamente sem verificações
  console.log('🔍 AdminDashboard - Renderizando sem useAuth');

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-glow text-primary">
              Dashboard Administrativo
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Modo Debug - Testando renderização
            </p>
          </div>
        </div>
      </div>

      {/* Debug: Log dos valores */}
      {console.log('🔍 AdminDashboard - Debug mode')}
      
      {/* Cards de Estatísticas - Temporariamente desabilitados */}
      <div className="text-center p-8 border border-dashed border-primary/20 rounded-lg">
        <h3 className="text-xl font-bold text-primary mb-4">Dashboard em Modo Debug</h3>
        <p className="text-muted-foreground">
          useAuth desabilitado temporariamente para identificar problema de renderização
        </p>
      </div>

      {/* Seção KPI Avançados - Temporariamente desabilitada para debug */}
      <div className="space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-glow text-primary">
            KPI Avançados
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Métricas avançadas para análise de performance
          </p>
        </div>
        
        <div className="text-center p-8 border border-dashed border-primary/20 rounded-lg">
          <p className="text-muted-foreground">
            KPIs avançados temporariamente desabilitados para debug
          </p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <QuickActions actions={mockQuickActions} />

      {/* Placeholder para outras seções */}
      <div className="text-center p-8 border border-dashed border-primary/20 rounded-lg">
        <p className="text-muted-foreground">
          Outras seções serão adicionadas aqui
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard; 